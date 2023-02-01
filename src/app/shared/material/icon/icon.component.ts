import { coerceBooleanProperty, BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewChecked,
  Attribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ErrorHandler,
  inject,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CanColor, mixinColor, ThemePalette } from '@angular/material/core';
import { MatIconRegistry, MAT_ICON_LOCATION, MatIconLocation } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MATERIAL_ICON_FONTSET } from '../../constants/global';

// Boilerplate for applying mixins to MatIcon.
/** @docs-private */
const _MatIconBase = mixinColor(
  class {
    constructor(public _elementRef: ElementRef) {}
  }
);

/** @docs-private */
export function MAT_ICON_LOCATION_FACTORY(): MatIconLocation {
  const _document = inject(DOCUMENT);
  const _location = _document ? _document.location : null;

  return {
    // Note that this needs to be a function, rather than a property, because Angular
    // will only resolve it once, but we want the current path on each call.
    getPathname: () => (_location ? _location.pathname + _location.search : ''),
  };
}

/** SVG attributes that accept a FuncIRI (e.g. `url(<something>)`). */
const funcIriAttributes = [
  'clip-path',
  'color-profile',
  'src',
  'cursor',
  'fill',
  'filter',
  'marker',
  'marker-start',
  'marker-mid',
  'marker-end',
  'mask',
  'stroke',
];

/** Selector that can be used to find all elements that are using a `FuncIRI`. */
const funcIriAttributeSelector = funcIriAttributes.map((attr) => `[${attr}]`).join(', ');

/** Regex that can be used to extract the id out of a FuncIRI. */
const funcIriPattern = /^url\(['"]?#(.*?)['"]?\)$/;

@Component({
  template: '<ng-content></ng-content>',
  selector: 'app-mat-icon',
  exportAs: 'matIcon',
  styleUrls: ['./icon.component.scss'],
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['color'],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    role: 'img',
    class: 'mat-icon notranslate',
    '[attr.data-mat-icon-type]': '_usingFontIcon() ? "font" : "svg"',
    '[attr.data-mat-icon-name]': '_svgName || fontIcon',
    '[attr.data-mat-icon-namespace]': '_svgNamespace || fontSet',
    '[class.mat-icon-inline]': 'inline',
    '[class.mat-icon-no-color]': 'color !== "primary" && color !== "accent" && color !== "warn"',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent extends _MatIconBase implements OnInit, AfterViewChecked, CanColor, OnDestroy {
  /**
   * Whether the icon should be inlined, automatically sizing the icon to match the font size of
   * the element the icon is contained in.
   */
  @Input()
  get inline(): boolean {
    return this._inline;
  }
  set inline(inline: boolean) {
    this._inline = coerceBooleanProperty(inline);
  }

  /** Name of the icon in the SVG icon set. */
  @Input()
  get svgIcon(): string {
    return this._svgIcon;
  }
  set svgIcon(value: string) {
    if (value !== this._svgIcon) {
      if (value) {
        this._updateSvgIcon(value);
      } else if (this._svgIcon) {
        this._clearSvgElement();
      }
      this._svgIcon = value;
    }
  }

  /** Font set that the icon is a part of. */
  @Input()
  get fontSet(): string {
    return this._fontSet;
  }
  set fontSet(value: string) {
    const newValue = this._cleanupFontValue(value);

    if (newValue !== this._fontSet) {
      this._fontSet = newValue;
      this._updateFontIconClasses();
    }
  }

  /** Name of an icon within a font set. */
  @Input()
  get fontIcon(): string {
    return this._fontIcon;
  }
  set fontIcon(value: string) {
    const newValue = this._cleanupFontValue(value);

    if (newValue !== this._fontIcon) {
      this._fontIcon = newValue;
      this._updateFontIconClasses();
    }
  }

  constructor(
    elementRef: ElementRef<HTMLElement>,
    private _iconRegistry: MatIconRegistry,
    @Attribute('aria-hidden') ariaHidden: string,
    @Inject(MAT_ICON_LOCATION) private _location: MatIconLocation,
    private readonly _errorHandler: ErrorHandler
  ) {
    super(elementRef);

    // If the user has not explicitly set aria-hidden, mark the icon as hidden, as this is
    // the right thing to do for the majority of icon use-cases.
    if (!ariaHidden) {
      elementRef.nativeElement.setAttribute('aria-hidden', 'true');
    }
  }

  // eslint-disable-next-line: variable-name
  static ngAcceptInputType_inline: BooleanInput;
  private _inline = false;
  private _svgIcon: string;
  private _fontSet: string;
  private _fontIcon: string;

  private _previousFontSetClass: string[] = [];
  private _previousFontIconClass: string;

  _svgName: string | null;
  _svgNamespace: string | null;

  /** Keeps track of the current page path. */
  private _previousPath?: string;

  /** Keeps track of the elements and attributes that we've prefixed with the current path. */
  private _elementsWithExternalReferences?: Map<Element, { name: string; value: string }[]>;

  /** Subscription to the current in-progress SVG icon request. */
  private _currentIconFetch = Subscription.EMPTY;

  /**
   * Splits an svgIcon binding value into its icon set and icon name components.
   * Returns a 2-element array of [(icon set), (icon name)].
   * The separator for the two fields is ':'. If there is no separator, an empty
   * string is returned for the icon set and the entire value is returned for
   * the icon name. If the argument is falsy, returns an array of two empty strings.
   * Throws an error if the name contains two or more ':' separators.
   * Examples:
   *   `'social:cake' -> ['social', 'cake']
   *   'penguin' -> ['', 'penguin']
   *   null -> ['', '']
   *   'a:b:c' -> (throws Error)`
   */
  private _splitIconName(iconName: string): [string, string] {
    if (!iconName) {
      return ['', ''];
    }
    const parts = iconName.split(':');
    switch (parts.length) {
      case 1:
        return ['', parts[0]]; // Use default namespace.
      case 2:
        return parts as [string, string];
      default:
        throw Error(`Invalid icon name: "${iconName}"`); // TODO: add an ngDevMode check
    }
  }

  ngOnInit() {
    // Update font classes because ngOnChanges won't be called if none of the inputs are present,
    // e.g. <app-mat-icon>arrow</app-mat-icon> In this case we need to add a CSS class for the default font.
    this._updateFontIconClasses();

    // Default to the global fontset
    if (!this.fontSet) {
      this.fontSet = MATERIAL_ICON_FONTSET;
    }
  }

  ngAfterViewChecked() {
    const cachedElements = this._elementsWithExternalReferences;

    if (cachedElements && cachedElements.size) {
      const newPath = this._location.getPathname();

      // We need to check whether the URL has changed on each change detection since
      // the browser doesn't have an API that will let us react on link clicks and
      // we can't depend on the Angular router. The references need to be updated,
      // because while most browsers don't care whether the URL is correct after
      // the first render, Safari will break if the user navigates to a different
      // page and the SVG isn't re-rendered.
      if (newPath !== this._previousPath) {
        this._previousPath = newPath;
        this._prependPathToReferences(newPath);
      }
    }
  }

  ngOnDestroy() {
    this._currentIconFetch.unsubscribe();

    if (this._elementsWithExternalReferences) {
      this._elementsWithExternalReferences.clear();
    }
  }

  _usingFontIcon(): boolean {
    return !this.svgIcon;
  }

  private _setSvgElement(svg: SVGElement) {
    this._clearSvgElement();

    // Workaround for IE11 and Edge ignoring `style` tags inside dynamically-created SVGs.
    // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10898469/
    // Do this before inserting the element into the DOM, in order to avoid a style recalculation.
    const styleTags = svg.querySelectorAll('style') as NodeListOf<HTMLStyleElement>;

    // eslint-disable-next-line: prefer-for-of
    for (let i = 0; i < styleTags.length; i++) {
      styleTags[i].textContent += ' ';
    }

    // Note: we do this fix here, rather than the icon registry, because the
    // references have to point to the URL at the time that the icon was created.
    const path = this._location.getPathname();
    this._previousPath = path;
    this._cacheChildrenWithExternalReferences(svg);
    this._prependPathToReferences(path);
    this._elementRef.nativeElement.appendChild(svg);
  }

  private _clearSvgElement() {
    const layoutElement: HTMLElement = this._elementRef.nativeElement;
    let childCount = layoutElement.childNodes.length;

    if (this._elementsWithExternalReferences) {
      this._elementsWithExternalReferences.clear();
    }

    // Remove existing non-element child nodes and SVGs, and add the new SVG element. Note that
    // we can't use innerHTML, because IE will throw if the element has a data binding.
    while (childCount--) {
      const child = layoutElement.childNodes[childCount];

      // 1 corresponds to Node.ELEMENT_NODE. We remove all non-element nodes in order to get rid
      // of any loose text nodes, as well as any SVG elements in order to remove any old icons.
      if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
        child.remove();
      }
    }
  }

  private _updateFontIconClasses() {
    if (!this._usingFontIcon()) {
      return;
    }

    const elem: HTMLElement = this._elementRef.nativeElement;
    const fontSetClasses = (
      this.fontSet
        ? this._iconRegistry.classNameForFontAlias(this.fontSet).split(/ +/)
        : this._iconRegistry.getDefaultFontSetClass()
    ).filter((className) => className.length > 0);

    this._previousFontSetClass.forEach((className) => elem.classList.remove(className));
    fontSetClasses.forEach((className) => elem.classList.add(className));
    this._previousFontSetClass = fontSetClasses;

    if (this.fontIcon !== this._previousFontIconClass && !fontSetClasses.includes('mat-ligature-font')) {
      if (this._previousFontIconClass) {
        elem.classList.remove(this._previousFontIconClass);
      }
      if (this.fontIcon) {
        elem.classList.add(this.fontIcon);
      }
      this._previousFontIconClass = this.fontIcon;
    }
  }

  /**
   * Cleans up a value to be used as a fontIcon or fontSet.
   * Since the value ends up being assigned as a CSS class, we
   * have to trim the value and omit space-separated values.
   */
  private _cleanupFontValue(value: string) {
    return typeof value === 'string' ? value.trim().split(' ')[0] : value;
  }

  /**
   * Prepends the current path to all elements that have an attribute pointing to a `FuncIRI`
   * reference. This is required because WebKit browsers require references to be prefixed with
   * the current path, if the page has a `base` tag.
   */
  private _prependPathToReferences(path: string) {
    const elements = this._elementsWithExternalReferences;

    if (elements) {
      elements.forEach((attrs, element) => {
        attrs.forEach((attr) => {
          element.setAttribute(attr.name, `url('${path}#${attr.value}')`);
        });
      });
    }
  }

  /**
   * Caches the children of an SVG element that have `url()`
   * references that we need to prefix with the current path.
   */
  private _cacheChildrenWithExternalReferences(element: SVGElement) {
    const elementsWithFuncIri = element.querySelectorAll(funcIriAttributeSelector);
    const elements = (this._elementsWithExternalReferences = this._elementsWithExternalReferences || new Map());

    // eslint-disable-next-line: prefer-for-of
    for (let i = 0; i < elementsWithFuncIri.length; i++) {
      funcIriAttributes.forEach((attr) => {
        const elementWithReference = elementsWithFuncIri[i];
        const value = elementWithReference.getAttribute(attr);
        const match = value ? value.match(funcIriPattern) : null;

        if (match) {
          let attributes = elements.get(elementWithReference);

          if (!attributes) {
            attributes = [];
            elements.set(elementWithReference, attributes);
          }

          attributes!.push({ name: attr, value: match[1] });
        }
      });
    }
  }

  /** Sets a new SVG icon with a particular name. */
  private _updateSvgIcon(rawName: string | undefined) {
    this._svgNamespace = null;
    this._svgName = null;
    this._currentIconFetch.unsubscribe();

    if (rawName) {
      const [namespace, iconName] = this._splitIconName(rawName);

      if (namespace) {
        this._svgNamespace = namespace;
      }

      if (iconName) {
        this._svgName = iconName;
      }

      this._currentIconFetch = this._iconRegistry
        .getNamedSvgIcon(iconName, namespace)
        .pipe(take(1))
        .subscribe(
          (svg) => this._setSvgElement(svg),
          (err: Error) => {
            const errorMessage = `Error retrieving icon ${namespace}:${iconName}! ${err.message}`;
            this._errorHandler.handleError(new Error(errorMessage));
          }
        );
    }
  }
}
