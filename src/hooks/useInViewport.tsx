import { useState, useEffect, useCallback, type RefObject } from "react";

function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export const useInViewport = (ref: RefObject<Element>) => {
  const [isVisible, setIsVisible] = useState(true);

  const update = useCallback(() => {
    if (ref.current) {
      setIsVisible(isElementInViewport(ref.current));
    }
  }, [ref]);

  useEffect(() => {
    ["scroll", "load", "DOMContentLoaded", "resize", "click"].forEach(
      (type) => {
        window.addEventListener(type, update);
      }
    );
    return () => {
      ["scroll", "load", "DOMContentLoaded", "resize", "click"].forEach(
        (type) => {
          window.removeEventListener(type, update);
        }
      );
    };
  }, [update]);
  return { isVisible, update };
};
