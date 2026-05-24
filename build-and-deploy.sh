#!/usr/bin/env bash
set -e

NAMESPACE="collaboration"
SERVICES=("api-gateway" "user-service" "messaging-service" "notification-service")

echo "════════════════════════════════════════"
echo "  CollabPlatform — Build & Deploy"
echo "════════════════════════════════════════"

# ── 1. Build Docker images ──────────────────
echo ""
echo "▶ Building Docker images..."
for svc in "${SERVICES[@]}"; do
  echo "  Building collaboration/${svc}:latest ..."
  docker build -t "collaboration/${svc}:latest" "./${svc}"
done
echo "✔ All images built."

# ── 2. Apply Kubernetes manifests ──────────
echo ""
echo "▶ Applying Kubernetes manifests..."

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongodb/deployment.yaml

echo "  Waiting for MongoDB to be ready..."
kubectl rollout status statefulset/mongodb -n "$NAMESPACE" --timeout=120s

kubectl apply -f k8s/user-service/deployment.yaml
kubectl apply -f k8s/messaging-service/deployment.yaml
kubectl apply -f k8s/notification-service/deployment.yaml
kubectl apply -f k8s/api-gateway/deployment.yaml
kubectl apply -f k8s/hpa.yaml

echo "✔ Manifests applied."

# ── 3. Wait for rollouts ────────────────────
echo ""
echo "▶ Waiting for deployments..."
for svc in "${SERVICES[@]}"; do
  kubectl rollout status "deployment/${svc}" -n "$NAMESPACE" --timeout=120s
done
echo "✔ All deployments ready."

# ── 4. Summary ──────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  Deployment complete!"
echo "════════════════════════════════════════"
echo ""
echo "Access points:"
echo "  API Gateway        : http://localhost:30000"
echo "  Notification SSE   : http://localhost:30003"
echo ""
echo "Useful commands:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl get services -n $NAMESPACE"
echo "  kubectl get hpa -n $NAMESPACE"
echo "  kubectl logs -f deployment/api-gateway -n $NAMESPACE"
echo ""
echo "Port forward alternative:"
echo "  kubectl port-forward svc/api-gateway 3000:3000 -n $NAMESPACE"
echo "  kubectl port-forward svc/notification-service 3003:3003 -n $NAMESPACE"