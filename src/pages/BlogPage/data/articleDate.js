const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

// Date-only editorial values must not shift a day in the visitor's timezone.
export const formatArticleDate = (isoDate) => formatter.format(new Date(`${isoDate}T12:00:00Z`));
