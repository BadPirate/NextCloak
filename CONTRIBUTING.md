# Contributing to Badpirate Garage OIDC Provider

We welcome contributions! By participating in this project, you agree to abide by the following guidelines.

## How to Contribute

1. Fork the repository.
2. Create a feature branch:
   ```sh
   git checkout -b feature/your-feature
   ```
3. Make your changes.
4. Ensure code passes lint and type checks:
   ```sh
   yarn lint
   ```
5. Commit with a descriptive message.
6. Push to your fork and open a Pull Request against the `main` branch.

## Code Style

- Follow the Airbnb style guide as defined in our ESLint configuration.
- Use ESLint (Airbnb + Next.js) and TypeScript for type safety.
- Write JSDoc or TypeScript doc comments as needed.
- All code must pass ESLint checks before being submitted.

## Package Management

- Use **yarn** for all package management tasks, not npm.
- Add new dependencies with `yarn add <package>` or `yarn add -D <package>` for dev dependencies.

## Testing

- Add or update tests for your changes.
- Run existing tests and ensure they pass.

## Pull Request Process

- Ensure your PR is focused and small.
- Include a clear description and reference any related issues.
- Address review feedback and update as requested.

## Environment Variables

- Do not commit any secret or private keys.
- Ensure `.env.local` is configured properly and excluded from commits.

## License

By contributing, you agree that your work will be licensed under the MIT License. See [LICENSE](LICENSE) for details.
