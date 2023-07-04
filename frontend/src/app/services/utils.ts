import { inject } from "@angular/core";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar } from "@angular/material/snack-bar";

interface IIsObject {
  (item: any): boolean;
}

interface IObject {
  [key: string]: any;
}

interface IDeepMerge {
  (target: IObject, ...sources: Array<IObject>): IObject;
}

export const generateUUID = function () {
  return (<any>[1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

/**
 * @description Method to check if an item is an object. Date and Function are considered
 * an object, so if you need to exclude those, please update the method accordingly.
 * @param item - The item that needs to be checked
 * @return {Boolean} Whether or not @item is an object
 */
export const isObject: IIsObject = (item: any): boolean => {
  return item === Object(item) && !Array.isArray(item);
};

/**
 * @description Method to perform a deep merge of objects
 * @param {Object} target - The targeted object that needs to be merged with the supplied @sources
 * @param {Array<Object>} sources - The source(s) that will be used to update the @target object
 * @return {Object} The final merged object
 */
export const deepMerge: IDeepMerge = (
  target: IObject,
  ...sources: Array<IObject>
): IObject => {
  // return the target if no sources passed
  if (!sources.length) {
    return target;
  }

  const result: IObject = target;

  if (isObject(result)) {
    const len: number = sources.length;

    for (let i = 0; i < len; i += 1) {
      const elm: any = sources[i];

      if (isObject(elm)) {
        for (const key in elm) {
          if (elm.hasOwnProperty(key)) {
            if (isObject(elm[key])) {
              if (!result[key] || !isObject(result[key])) {
                result[key] = {};
              }
              deepMerge(result[key], elm[key]);
            } else {
              if (Array.isArray(result[key]) && Array.isArray(elm[key])) {
                // concatenate the two arrays and remove any duplicate primitive values
                result[key] = Array.from(new Set(result[key].concat(elm[key])));
              } else {
                result[key] = elm[key];
              }
            }
          }
        }
      }
    }
  }

  return result;
};

export const copyToClipboardFn = () => {
  const clipboard = inject(Clipboard);
  const snackbar = inject(MatSnackBar);

  return (
    copyText: string,
    opts?: {
      successText?: string;
      errorText?: string;
    }
  ) => {
    const isCopied = clipboard.copy(copyText);
    if (isCopied) {
      snackbar.open(
        opts?.successText ?? "Der Text wurde in die Zwischenablage kopiert."
      );
    } else {
      snackbar.open(opts?.errorText ?? "Der Text konnte nicht kopiert werden.");
    }
  };
};
