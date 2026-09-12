# Local-Only Secrets

This folder is for development keys and other private hackathon notes that must stay off GitHub. Everything in this directory is ignored except this README.

Create `local-only/.env` and add:

```text
openrouterKey=your-key-here
```

Codex can read that file when asked to run a local API test. It should never print the key, copy it into application code, add it to a command line, or include it in the hackathon log.

The public browser app cannot read this file. Paste the key into the test harness when testing the deployed page.
