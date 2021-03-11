import React, {
  Context,
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type UpdateSettingHandler = (settingInstance: SettingComponent, value: any) => void;

type ValueType = Map<SettingComponent, any>;
type ValueContext = Context<ValueType>;
type OptionalUpdateSettingHandler = UpdateSettingHandler | undefined;
type ConfigContext = Context<OptionalUpdateSettingHandler>;

export type ConfigProps = {};

export type ConfigurableContextComponent = FC<ConfigProps> & {
  readonly $$valueContext: ValueContext;
  readonly $$configContext: ConfigContext;
};

export const createConfigurableContext = (): ConfigurableContextComponent => {
  const defaultMap = new Map<SettingComponent, any>();
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

export type SettingProps = {
  children?: any;
};

export type SettingComponent = (props: SettingProps) => null;

export const createSetting = (configurableContextComponent: ConfigurableContextComponent): SettingComponent => {
  const settingComponent: SettingComponent = ({ children }) => {
    const { $$configContext } = configurableContextComponent;
    const updateSetting = useContext<OptionalUpdateSettingHandler>($$configContext);

    useEffect(() => {
      if (updateSetting) {
        updateSetting(settingComponent, children);
      }
    }, []);

    return null;
  };

  return settingComponent;
};
