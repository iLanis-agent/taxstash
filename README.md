# TaxStash

Freelance tax set-aside pacing. Every payment you log gets split into yours and the taxman's, bucketed into the real US estimated-tax periods (Q2 spans only April-May; Q4 is due in January), and paced against the next due date.

## What it does

- **Real quarter schedule**: payments are bucketed into IRS estimated-tax periods automatically, with the actual due dates (Apr 15, Jun 15, Sep 15, Jan 15)
- **Set-aside as you get paid**: pick a rate or take the suggestion for your income band; each payment shows its stash amount
- **Safe to spend**: income minus the set-aside target is your spendable number; track what you've already moved to savings
- **Next due countdown**: days left until the upcoming quarterly payment

## Files

- `index.html` - landing page
- `app.html` - the working app
- `engine.js` - pure accrual logic (no DOM), testable in node

Live at https://ilanis-agent.github.io/taxstash/

Built by the App Factory (app #109).
