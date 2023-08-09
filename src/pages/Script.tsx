import { useEffect } from 'react';

interface ScriptProps {
  src: string;
}

const Script = ({ src }: ScriptProps) => {
  useEffect(() => {
    // Check if the condition has already been met
    const conditionMet = localStorage.getItem('conditionMet') === 'true';
    if (conditionMet) {
      console.log('Condition already met, not showing ad');
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
    console.log('Script added to document body:', script);

    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientX > window.innerWidth * 3 / 4 && event.clientY < window.innerHeight / 8) {
        console.log('Condition met, removing script, iframe, and event listener');
        document.body.removeChild(script);
        // Find and remove the iframe element based on its style
        const iframe = [...document.querySelectorAll('iframe')].find((iframe) =>
          iframe.getAttribute('style')?.includes('!important')
        );
        if (iframe) {
          iframe.remove();
        }
        document.removeEventListener('mousemove', handleMouseMove);
        // Remember that the condition has been met
        localStorage.setItem('conditionMet', 'true');
      } else {
        console.log('Condition not met, script and event listener not removed');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      console.log('Cleanup function called, removing script and event listener');
      document.body.removeChild(script);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [src]);

  return null;
};

export default Script;