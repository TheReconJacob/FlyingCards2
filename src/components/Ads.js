import { useEffect } from 'react';

const adClient = 'pub-5406034099856189';
let pageLevelAdsEnabled = false;

function enablePageLevelAds() {
  if (window.adsbygoogle && !pageLevelAdsEnabled) {
    window.adsbygoogle.push({
      google_ad_client: adClient,
      enable_page_level_ads: true,
    });
    pageLevelAdsEnabled = true;
  }
}

export default function Ad() {
  useEffect(() => {
    enablePageLevelAds();
  }, []);

  return null;
}