#!/usr/bin/env bash
set -euo pipefail

AGENTS_PATH=".agents"
AGENTS_URL="git@github.com:lpiedade/codex-agents.git"
BRANCH="main"
UPDATE_REMOTE=true

usage() {
  cat <<USAGE
Usage: ./get-agents.sh [--branch <name>] [--remote]

Options:
  --branch <name>   Branch to track for the .agents submodule (default: main)
  --remote          Update .agents to the latest commit from tracked branch
  -h, --help        Show this help message
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      [[ $# -lt 2 ]] && { echo "Missing value for --branch" >&2; exit 1; }
      BRANCH="$2"
      shift 2
      ;;
    --remote)
      UPDATE_REMOTE=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

path_exists=false
is_submodule=false

if [[ -e "$AGENTS_PATH" ]]; then
  path_exists=true
fi

if git config -f .gitmodules --get "submodule.$AGENTS_PATH.path" >/dev/null 2>&1; then
  is_submodule=true
fi

if [[ "$path_exists" == true && "$is_submodule" == false ]]; then
  echo "Error: $AGENTS_PATH exists but is not configured as a submodule." >&2
  echo "Move/remove it or convert it to a submodule, then rerun this script." >&2
  exit 1
fi

if [[ "$path_exists" == false ]]; then
  git submodule add -b "$BRANCH" "$AGENTS_URL" "$AGENTS_PATH"
fi

# Ensure branch tracking is configured in both .gitmodules and local git config.
git submodule set-branch --branch "$BRANCH" "$AGENTS_PATH"
git config -f .gitmodules submodule."$AGENTS_PATH".branch "$BRANCH"
git config submodule."$AGENTS_PATH".branch "$BRANCH"

git submodule sync -- "$AGENTS_PATH"
git submodule update --init --recursive -- "$AGENTS_PATH"

if [[ "$path_exists" == true && "$is_submodule" == true ]]; then
  git submodule update --remote --recursive -- "$AGENTS_PATH"
elif [[ "$UPDATE_REMOTE" == true ]]; then
  git submodule update --remote --recursive -- "$AGENTS_PATH"
fi

echo "Configured $AGENTS_PATH to track branch '$BRANCH'."
if [[ "$path_exists" == true && "$is_submodule" == true ]]; then
  echo "$AGENTS_PATH already existed as a submodule; updated from remote branch '$BRANCH'."
  echo "If the commit changed, commit the updated submodule pointer in this repo."
elif [[ "$UPDATE_REMOTE" == true ]]; then
  echo "Updated $AGENTS_PATH from remote."
  echo "If the commit changed, commit the updated submodule pointer in this repo."
fi
