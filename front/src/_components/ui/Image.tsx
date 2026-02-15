/**
 * Image component
 */

/**
 * Optimized image component
 * @param src - Image source URL
 * @param alt - Alternative text
 * @param width - Image width
 * @param height - Image height
 * @param lazy - Enable lazy loading (default: true)
 * @param className - Additional CSS classes
 */
export default function Image({
  src,
  alt,
  width,
  height,
  lazy = true,
  className = "",
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  className?: string;
}) {
  return (
    // image
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? "lazy" : undefined}
      className={`w-full rounded-lg my-8 cursor-pointer transition-opacity hover:opacity-80 blog-image ${className}`}
    />
  );
}
