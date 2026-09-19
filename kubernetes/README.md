# Kubernetes deployment

The GitHub Actions workflow publishes images to GitHub Container Registry (GHCR) and deploys the `main` branch to the `digitalazizi` namespace.

Before enabling the deployment job, configure these GitHub settings:

- Create a `production` environment and add the `KUBE_CONFIG` secret. Its value must be the base64-encoded kubeconfig for a service account limited to the `digitalazizi` namespace.
- Create the `ghcr-pull-secret` image-pull secret in that namespace if the GHCR package is private. The manifest already references this secret.
- Grant that service account permission to manage Deployments, Services, Pods, and ReplicaSets in the namespace.

Create the image-pull secret with a GitHub personal access token that has `read:packages`:

```sh
kubectl create namespace digitalazizi
kubectl -n digitalazizi create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN
```

An Ingress is intentionally not included because its host name, TLS issuer, and ingress controller depend on the cluster. Point an Ingress backend at the `digitalazizi` Service on port `80` once those values are known.
