export type CargoItem = Record<string, any>;

export type ValidateJsonResult = {
  items?: CargoItem[];
  errors?: string[];
  warnings?: string[];
  ok?: boolean;
  [k: string]: any;
};
