# Component Context

- All UI components use Tailwind CSS utility classes
- Board colors use custom tokens: bg-board-bg, text-board-muted, border-board-border
- Flight data comes from useFlightsStore hook, not from props drilling
- New FIDS components go in components/fids/, admin components in components/admin/