#!/usr/bin/env bash
set -e
NAMESPACE="collaboration"

echo "▶ Removing all resources..."
kubectl delete namespace "$NAMESPACE" --ignore-not-found
echo "✔ Done. All resources removed."