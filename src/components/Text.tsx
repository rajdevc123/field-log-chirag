import React from 'react';

type TextScale =
  | 'heroTitle'
  | 'aboutTitle'
  | 'aboutCopy'
  | 'title'
  | 'subtitle'
  | 'bodyCopyLarge'
  | 'bodyCopyMedium'
  | 'bodyCopySmall';

const scaleClassMap: Record<TextScale, string> = {
  heroTitle: 'Text_heroTitle',
  aboutTitle: 'Text_aboutTitle',
  aboutCopy: 'Text_aboutCopy',
  title: 'Text_title',
  subtitle: 'Text_subtitle',
  bodyCopyLarge: 'Text_bodyCopyLarge',
  bodyCopyMedium: 'Text_bodyCopyMedium',
  bodyCopySmall: 'Text_bodyCopySmall',
};

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  scale?: TextScale;
  children?: React.ReactNode;
  className?: string;
}

export function Text({
  as: Component = 'p',
  scale = 'bodyCopyMedium',
  children,
  className = '',
  ...rest
}: TextProps) {
  const scaleClass = scaleClassMap[scale] || 'Text_bodyCopyMedium';
  return (
    <Component className={`${scaleClass} ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}

export const HeroTitle = (props: TextProps) => (
  <Text as="h1" scale="heroTitle" {...props} />
);
export const AboutTitle = (props: TextProps) => (
  <Text as="h1" scale="aboutTitle" {...props} />
);
export const AboutCopy = (props: TextProps) => (
  <Text as="p" scale="aboutCopy" {...props} />
);
export const Title = (props: TextProps) => (
  <Text as="h1" scale="title" {...props} />
);
export const Subtitle = (props: TextProps) => (
  <Text as="h2" scale="subtitle" {...props} />
);
export const BodyCopyLarge = (props: TextProps) => (
  <Text as="p" scale="bodyCopyLarge" {...props} />
);
export const BodyCopyMedium = (props: TextProps) => (
  <Text as="p" scale="bodyCopyMedium" {...props} />
);
export const BodyCopySmall = (props: TextProps) => (
  <Text as="p" scale="bodyCopySmall" {...props} />
);
