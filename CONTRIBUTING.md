 # Contributing to NextCloak

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
    npm run lint
    ```
 5. Commit with a descriptive message.
 6. Push to your fork and open a Pull Request against the `main` branch.

 ## Code Style

 - Follow existing code patterns and conventions.
 - Use ESLint (Airbnb + Next.js) and TypeScript for type safety.
 - Write JSDoc or TypeScript doc comments as needed.

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