// Lighthouse CI: every page of dist/ is audited, served from disk, and each
// category must score 95 or more. Mobile by default; `npm run lighthouse`
// runs it a second time with the desktop preset. Run after `npm run build`.
module.exports = {
  ci: {
    collect: {
      staticDistDir: "dist",
      // 0 lifts the default limit of 5 pages: a new page is audited with nothing to add.
      maxAutodiscoverUrls: 0,
      // Scores move between runs; the best of three is kept.
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
      },
    },
    upload: {
      // The reports stay in the CI run, nothing is sent to a public server.
      target: "filesystem",
      outputDir: ".lighthouseci/mobile",
    },
  },
};
