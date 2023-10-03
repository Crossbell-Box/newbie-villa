export type GetAbiEvent<
  Events extends ReadonlyArray<{ name: string }>,
  Name extends Events[number]['name'],
> = {
  [K in Events[number]['name']]: Extract<Events[number], { name: K }>;
}[Name];

export function getAbiEvent<
  Events extends ReadonlyArray<{ name: string }>,
  Name extends Events[number]['name'],
>(events: Events, eventName: Name): GetAbiEvent<Events, Name> {
  return events.find((event) => event.name === eventName) as any;
}
