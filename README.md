# Where Does $100 Go?

An editorial-quality interactive explainer that traces a card payment through the payments ecosystem — from authorization to settlement to payout — showing how fees, time, and intermediaries shape what the merchant actually receives.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npx vercel
```

Or connect the repo to [Vercel](https://vercel.com) for automatic deployments.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Frontend-only (no backend required)

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Main page orchestrating all sections
│   └── globals.css         # Theme tokens, animations, utilities
├── components/
│   ├── Hero.tsx            # Above-the-fold headline + animated flow
│   ├── ScrollNarrative.tsx # Progressive reveal scenes (A–F)
│   ├── PaymentFlowDiagram.tsx  # Interactive SVG network diagram
│   ├── ControlPanel.tsx    # Scenario configuration inputs
│   ├── FeeBreakdown.tsx    # Dynamic fee visualization
│   ├── ScenarioSwitcher.tsx    # Preset scenario comparison
│   ├── AnnotationCard.tsx  # Hover/click educational popups
│   └── FinalTakeaway.tsx   # Closing editorial statement
└── lib/
    ├── types.ts            # TypeScript interfaces
    ├── paymentModel.ts     # Fee calculation engine
    ├── annotationData.ts   # Educational annotation content
    ├── scenarios.ts        # Preset scenario configurations
    └── hooks.ts            # Intersection observer, reduced motion
```
