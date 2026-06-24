import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useScrollStore } from '@/lib/scrollStore';
import { LANDMARKS, altitudeAt, routePointAt } from './mapRoute';

const RAD = Math.PI / 180;

/** Initial compass bearing (radians, 0 = north) from point a → b. */
function bearing(a: [number, number], b: [number, number]) {
  const lat1 = a[1] * RAD;
  const lat2 = b[1] * RAD;
  const dLon = (b[0] - a[0]) * RAD;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return Math.atan2(y, x);
}

/**
 * Cesium replacement for the homepage 3D satellite flight. Uses Esri World
 * Imagery (free, token-less, fast global CDN) over a flat ellipsoid (no terrain
 * tile requests) so the scroll-driven fly-through loads fast and stays smooth.
 *
 * Preserves everything the Mapbox version did: clickable landmark markers that
 * navigate to destinations, a progressively-drawn route line, and the
 * scroll-store `ready` / `preloadProgress` signals that gate the cloud intro.
 */
export function CesiumFlight() {
  const ref = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setReady = useScrollStore((s) => s.setReady);
  const setPreloadProgress = useScrollStore((s) => s.setPreloadProgress);

  useEffect(() => {
    if (!ref.current) return;

    // No Cesium Ion assets are used, so no access token is required.
    Cesium.Ion.defaultAccessToken = '';

    const viewer = new Cesium.Viewer(ref.current, {
      // Esri World Imagery — token-less satellite tiles served from a fast CDN.
      baseLayer: Cesium.ImageryLayer.fromProviderAsync(
        Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
          { enablePickFeatures: false },
        ),
        {},
      ),
      // Flat ellipsoid → zero terrain tile requests = faster, fewer round-trips.
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      selectionIndicator: false,
      infoBox: false,
      // Only render when something actually changes (camera move / tile load).
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      contextOptions: { webgl: { powerPreference: 'high-performance' } },
    });

    const scene = viewer.scene;
    const camera = viewer.camera;
    // Scroll drives the camera — disable all direct map interaction.
    scene.screenSpaceCameraController.enableInputs = false;
    scene.globe.depthTestAgainstTerrain = false;

    let eased = 0;
    let raf = 0;
    let applied = -1;
    let done = false;

    // --- Progressive route polyline ----------------------------------------
    const routeLinePositions = () => {
      const n = LANDMARKS.length;
      const scaled = eased * (n - 1);
      const idx = Math.min(Math.floor(scaled), n - 2);
      const frac = scaled - idx;
      const coords = LANDMARKS.slice(0, idx + 1).map((l) => l.coordinates);
      const a = LANDMARKS[idx].coordinates;
      const b = LANDMARKS[Math.min(idx + 1, n - 1)].coordinates;
      coords.push([a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac]);
      const flat: number[] = [];
      for (const c of coords) flat.push(c[0], c[1], 80);
      return Cesium.Cartesian3.fromDegreesArrayHeights(flat);
    };
    viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(routeLinePositions, false),
        width: 3,
        material: Cesium.Color.fromCssColorString('#ff7a3d').withAlpha(0.75),
        arcType: Cesium.ArcType.GEODESIC,
      },
    });

    // --- HTML markers (identical .map-landmark look + click → navigate) -----
    const markers = LANDMARKS.map((lm) => {
      const el = document.createElement('button');
      el.className = 'map-landmark';
      el.innerHTML = `<span class="map-landmark__dot"></span><span class="map-landmark__name">${lm.name}</span>`;
      el.style.position = 'absolute';
      el.style.transform = 'translate(-50%, -100%)';
      el.style.pointerEvents = lm.destinationSlug ? 'auto' : 'none';
      if (lm.destinationSlug) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => navigate(`/destination/${lm.destinationSlug}`));
      }
      overlayRef.current?.appendChild(el);
      return { el, pos: Cesium.Cartesian3.fromDegrees(lm.coordinates[0], lm.coordinates[1], 0) };
    });

    const scratch = new Cesium.Cartesian2();
    // Sphere approximating the globe (polar radius so we never over-occlude),
    // used to hide markers that fall on the far side of the horizon.
    const globeSphere = new Cesium.BoundingSphere(
      Cesium.Cartesian3.ZERO,
      Cesium.Ellipsoid.WGS84.minimumRadius,
    );
    const updateMarkers = () => {
      const occluder = new Cesium.Occluder(globeSphere, camera.positionWC);
      for (const m of markers) {
        const win = Cesium.SceneTransforms.worldToWindowCoordinates(scene, m.pos, scratch);
        if (win && occluder.isPointVisible(m.pos)) {
          m.el.style.display = 'flex';
          m.el.style.left = `${win.x}px`;
          m.el.style.top = `${win.y}px`;
        } else {
          m.el.style.display = 'none';
        }
      }
    };
    scene.postRender.addEventListener(updateMarkers);

    // --- Camera aim (mirrors the Mapbox free-camera flight) ----------------
    const aim = (f: number) => {
      const target = routePointAt(f);
      const alt = altitudeAt(f);
      const a = routePointAt(Math.max(0, f - 0.0012));
      const b = routePointAt(Math.min(1, f + 0.0012));
      const hdg = bearing(a, b);
      const targetC = Cesium.Cartesian3.fromDegrees(target[0], target[1], 0);
      // Camera sits `alt * 1.8` behind/above the target, looking forward + down.
      camera.lookAt(targetC, new Cesium.HeadingPitchRange(hdg, Cesium.Math.toRadians(-32), alt * 1.8));
      scene.requestRender();
    };

    const tick = () => {
      const targetP = useScrollStore.getState().progress;
      eased += (targetP - eased) * 0.14;
      if (Math.abs(targetP - eased) < 0.0003) eased = targetP;
      if (Math.abs(eased - applied) > 0.00004) {
        applied = eased;
        aim(eased);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (done) return;
      done = true;
      window.clearTimeout(cap);
      setPreloadProgress(1);
      setReady(true);
      aim(0);
      applied = -1;
      raf = requestAnimationFrame(tick);
    };

    // Frame the start, then go live as soon as the first tiles settle (or cap).
    aim(0);
    let firstLoaded = false;
    const onProgress = (remaining: number) => {
      if (firstLoaded) return;
      const p = remaining === 0 ? 1 : Math.max(0.1, Math.min(0.95, 1 - remaining / 60));
      setPreloadProgress(p);
      if (remaining === 0) {
        firstLoaded = true;
        start();
      }
    };
    scene.globe.tileLoadProgressEvent.addEventListener(onProgress);
    const cap = window.setTimeout(start, 4000);

    return () => {
      window.clearTimeout(cap);
      cancelAnimationFrame(raf);
      scene.postRender.removeEventListener(updateMarkers);
      scene.globe.tileLoadProgressEvent.removeEventListener(onProgress);
      for (const m of markers) m.el.remove();
      camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      viewer.destroy();
    };
  }, [navigate, setReady, setPreloadProgress]);

  return (
    <div className="experience-canvas mapflight cesium-flight" aria-hidden="true">
      <div className="cesium-flight__viewer" ref={ref} />
      <div className="cesium-flight__markers" ref={overlayRef} />
    </div>
  );
}

export default CesiumFlight;
