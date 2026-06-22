import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * Cinematic colour grading. Bloom for god-rays / glowing markers, depth-of-field
 * for that "tilt-shift miniature world" look, vignette + grain for filmic mood.
 * On low-power devices we drop DoF + grain and soften bloom to protect FPS.
 */
export function Effects({ lowPower = false }: { lowPower?: boolean }) {
  if (lowPower) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={4}>
      <DepthOfField focusDistance={0.012} focalLength={0.06} bokehScale={3.5} height={480} />
      <Bloom intensity={1.1} luminanceThreshold={0.45} luminanceSmoothing={0.35} mipmapBlur />
      <Vignette eskil={false} offset={0.22} darkness={0.78} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.18} />
    </EffectComposer>
  );
}
