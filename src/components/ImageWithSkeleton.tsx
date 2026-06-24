import { useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Called in addition to clearing the skeleton when the image errors. */
  onImgError?: React.ReactEventHandler<HTMLImageElement>;
};

/**
 * <img> wrapped in a shimmering skeleton placeholder that fades out once the
 * image has decoded. Keeps card grids and galleries from popping in abruptly.
 */
export function ImageWithSkeleton({ className, onImgError, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`img-skel ${loaded ? 'is-loaded' : ''}`}>
      <img
        {...props}
        className={className}
        loading={props.loading ?? 'lazy'}
        decoding="async"
        onLoad={(e) => {
          setLoaded(true);
          props.onLoad?.(e);
        }}
        onError={(e) => {
          setLoaded(true);
          onImgError?.(e);
          props.onError?.(e);
        }}
      />
    </span>
  );
}
