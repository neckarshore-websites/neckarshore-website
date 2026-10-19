import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/social";

/**
 * Icon-only links to an app's social channels. Each link is named for screen readers
 * ("Kaze auf Instagram"); the SVG itself is decorative (`aria-hidden`). External, so it
 * opens in a new tab with `rel="noopener noreferrer"` (TC-LNK-*).
 */
export function SocialLinks({
  name,
  slug,
  links,
  className = "",
}: {
  name: string;
  slug: string;
  links: SocialLink[];
  className?: string;
}) {
  if (links.length === 0) return null;
  return (
    <ul
      className={`flex list-none items-center gap-3 p-0 ${className}`.trim()}
      data-social-links
    >
      {links.map(({ platform, href }) => {
        const { label, path } = SOCIAL_PLATFORMS[platform];
        return (
          <li key={platform}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} auf ${label}`}
              title={`${name} auf ${label}`}
              data-track={`product_social_${platform}_${slug}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:text-accent dark:text-text-tertiary dark:hover:text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d={path} />
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
