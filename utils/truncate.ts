const truncateURL = (url: string): string => {
  url = url.replace("http://", "").replace("https://", "");

  return truncateString(url);
};

const truncateString = (address: string | undefined): string => {
  if (!address) {
    return "";
  }
  return address.slice(0, 16) + "..." + address.slice(-6);
};

export { truncateURL, truncateString };
