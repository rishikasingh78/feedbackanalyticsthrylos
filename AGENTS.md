<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Feedback is stored in `feedback`; public inserts remain available, but SELECT is restricted to the server dashboard read, which returns only non-personal columns.
- The dashboard at `/` is open without a password (user's choice); `/dashboard-access` redirects to it. Keep the public form at `/feedback`.
- Sentiment lives in `src/lib/sentiment.ts` (`analyzeSentiment`) so it can be swapped for an AI/NLP model without touching callers.
- Demo rows (`is_demo = true`) are seeded by migration and shown only while no real feedback exists.
- Feedback form validation lives in `src/lib/feedback-validation.ts` and is tested independently; database constraints remain the server-side safeguard for direct inserts.
