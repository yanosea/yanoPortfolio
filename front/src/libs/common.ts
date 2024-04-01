export function getThisYear(): number {
  return new Date().getFullYear();
}
export async function getLatestVersion(): Promise<string | null> {
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
