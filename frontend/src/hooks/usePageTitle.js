import * as React from 'react';

export default function usePageTitle(title) {
  React.useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Seald` : 'Seald';
    return () => {
      document.title = previous;
    };
  }, [title]);
}