import React, { Context, createContext, FC, PropsWithChildren, useCallback, useState } from 'react';

export type UpdateSettingHandler = (settingInstance: () => any, value: any) => void;

type ValueType = Map<any, any>;
type ValueContext = Context<ValueType>;
type OptionalUpdateSettingHandler = UpdateSettingHandler | undefined;
type ConfigContext = Context<OptionalUpdateSettingHandler>;

export type ConfigProps = {};

export type ConfigurableContextComponent = FC<ConfigProps> & {
  readonly $$valueContext: ValueContext;
  readonly $$configContext: ConfigContext;
};

export const createConfigurableContext = (): ConfigurableContextComponent => {
  const defaultMap = new Map();
  const $$valueContext = createContext<ValueType>(defaultMap);
  const $$configContext = createContext<OptionalUpdateSettingHandler>(undefined);
  const { Provider: ValueProvider } = $$valueContext;
  const { Provider: ConfigProvider } = $$configContext;

  return Object.assign(
    ({ children }: PropsWithChildren<ConfigProps>) => {
      const [map, setMap] = useState(defaultMap);
      const updateSetting = useCallback<UpdateSettingHandler>(
        (settingInstance, value) => {
          setMap(new Map(map).set(settingInstance, value));
        },
        [map, setMap]
      );

      return (
        <ValueProvider value={map}>
          <ConfigProvider value={updateSetting}>{children}</ConfigProvider>
        </ValueProvider>
      );
    },
    {
      $$valueContext,
      $$configContext,
    }
  );
};
