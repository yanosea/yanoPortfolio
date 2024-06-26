export async function setCopyRightYear() {
  const yanoPortfolioCopyRightYearElement = document.getElementById("yanopPortfolioCopyRightYear");
  const thisYear: number = new Date().getFullYear();
  yanoPortfolioCopyRightYearElement.textContent = `© ${thisYear}`;
}

export async function setLatestVersion() {
  const yanoPortfolioVersionElement = document.getElementById("yanopPortfolioVersion");
  const yanoPortfolioVersionLinkElement = document.getElementById(
    "yanopPortfolioVersionLink",
  ) as HTMLAnchorElement;
  const latestVersion: string = await getLatestVersion();
  if (!latestVersion) {
    yanoPortfolioVersionElement.style.display = "none";
    console.error("failed getting latest version info...");
    return;
  }

  yanoPortfolioVersionElement.style.display = "flex";
  yanoPortfolioVersionElement.textContent = latestVersion;
  yanoPortfolioVersionLinkElement.href =
    "https://github.com/yanosea/yanoPortfolio/releases/tag/" + latestVersion;
}

async function getLatestVersion(): Promise<string | null> {
  const url: string = "https://api.github.com/repos/yanosea/yanoPortfolio/releases/latest";
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.tag_name;
    }
  } catch (error) {
    console.error(`failed fetching from ${url}`);
    return null;
  }
}
