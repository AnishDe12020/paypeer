const truncateURL = (url: string): string => {
  url = url.replace("http://", "").replace("https://", "");

  return truncateString(url);
};

const truncateString = (address: string | undefined): string => {
  if (!address) {
    return "";
  }
  return address.slice(0, 4) + "..." + address.slice(-4);
};

export { truncateURL, truncateString };
