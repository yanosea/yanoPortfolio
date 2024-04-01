export async function setCopyRight() {
  const yanoPortfolioCopyRightElement = document.getElementById(
    "yanopPortfolioCopyRight",
  );
  const thisYear: number = new Date().getFullYear();
  yanoPortfolioCopyRightElement.textContent = `© ${thisYear} yanosea`;
}

export async function setLatestVersion() {
  const yanoPortfolioVersionElement = document.getElementById(
    "yanopPortfolioVersion",
  );
  const latestVersion: string = await getLatestVersion();
  if (!latestVersion) {
    yanoPortfolioVersionElement.style.display = "none";
    console.error("failed getting latest version info...");
    return;
  }

  yanoPortfolioVersionElement.style.display = "flex";
  yanoPortfolioVersionElement.textContent = latestVersion;
}

async function getLatestVersion(): Promise<string | null> {
  const url: string =
    "https://api.github.com/repos/yanosea/yanoPortfolio/releases/latest";
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
