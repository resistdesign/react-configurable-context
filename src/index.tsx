import React, { Context, createContext, FC, useCallback, useContext, useEffect, useState } from 'react';

export type UpdateSettingHandler<T> = (settingInstance: SettingComponent<T>, value: T) => void;

type ValueType<T> = Map<SettingComponent<T>, T>;
type ValueContext<T> = Context<ValueType<T>>;
type OptionalUpdateSettingHandler<T> = UpdateSettingHandler<T> | undefined;
type ConfigContext<T> = Context<OptionalUpdateSettingHandler<T>>;

export type ConfigProps = {};

export type ConfigurableContextComponent = FC<ConfigProps> & {
  readonly $$valueContext: ValueContext<any>;
  readonly $$configContext: ConfigContext<any>;
};

export const createConfigurableContext = (): ConfigurableContextComponent => {
  const defaultMap = new Map<SettingComponent<any>, any>();
  const $$valueContext = createContext<ValueType<any>>(defaultMap);
  const $$configContext = createContext<OptionalUpdateSettingHandler<any>>(undefined);
  const { Provider: ValueProvider } = $$valueContext;
  const { Provider: ConfigProvider } = $$configContext;
  const ConfigurableContext: FC<ConfigProps> = ({ children }) => {
    const [map, setMap] = useState(defaultMap);
    const updateSetting = useCallback<UpdateSettingHandler<any>>(
      (settingInstance, value) => {
        if (map.get(settingInstance) !== value) {
          setMap(new Map(map).set(settingInstance, value));
        }
      },
      [map, setMap]
    );

    return (
      <ValueProvider value={map}>
        <ConfigProvider value={updateSetting}>{children}</ConfigProvider>
      </ValueProvider>
    );
  };

  return Object.assign(ConfigurableContext, {
    $$valueContext,
    $$configContext,
  });
};

export type SettingProps<T> = {
  children: T;
};

export type SettingComponent<T> = FC<SettingProps<T>> & {
  readonly $$valueContext: ValueContext<T>;
};

export const createSetting = <T extends unknown = any>(
  configurableContextComponent: ConfigurableContextComponent
): SettingComponent<T> => {
  const { $$valueContext, $$configContext } = configurableContextComponent;
  const Setting: FC<SettingProps<T>> = ({ children }) => {
    const updateSetting = useContext<OptionalUpdateSettingHandler<T>>($$configContext);

    useEffect(() => {
      if (updateSetting) {
        updateSetting(settingComponent, children);
      }
    }, [updateSetting, children]);

    return null;
  };
  const settingComponent: SettingComponent<T> = Object.assign(Setting, { $$valueContext });

  return settingComponent;
};

export const useSetting = <T extends unknown = any>(settingComponent: SettingComponent<T>): T | undefined => {
  const { $$valueContext } = settingComponent;
  const map = useContext<ValueType<any>>($$valueContext);

  return map.get(settingComponent);
};
