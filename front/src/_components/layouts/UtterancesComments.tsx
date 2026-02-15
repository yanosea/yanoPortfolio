/**
 * Utterances comments component
 */

/**
 * GitHub comments integration using Utterances
 * @param repo - GitHub repository for comments
 */
export default function UtterancesComments({ repo }: { repo: string }) {
  return (
    // comments
    <div
      id="utterances-container"
      data-repo={repo}
      data-issue-term="pathname"
      data-label="comment"
      className="utterances-wrapper mt-12"
    >
    </div>
  );
}
