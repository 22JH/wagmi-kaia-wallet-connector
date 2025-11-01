export const checkIsKaiaBrowser = () => {
  return typeof window.klaytn !== "undefined" && window.klaytn.isMobile;
};
