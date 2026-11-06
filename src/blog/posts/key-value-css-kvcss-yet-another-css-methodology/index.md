---
title: "Key-Value CSS (KVCSS): Yet Another CSS Methodology"
published_at: 2026-11-05T10:26:00.000Z
snippet: It's been a few years since we had a new CSS naming convention, so it
  seems like the perfect time to propose a new one.
tags: CSS
authors: Danny Wahl
draft: false
---

I'll be honest, I never really cared for [BEM](https://bem.info/en/methodology/quick-start/). I found it overly verbose, but I will admit that it addressed a lot of common "gotchas" when working with CSS. But with modern CSS a lot of the gotchas are addressed with built-ins like [@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer) and [`:scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:scope) removing the need for BEM's terseness.

I was recently working on porting a React UI framework to pure HTML/JS/CSS and wanted the CSS selectors to provide a similar developer experience for authors that might be migrating from the React version to the HTML version.

In my research I came across [RSCSS](https://ricostacruz.com/rscss/) which I really liked. Out of the gate it presupposed that you're using the modern CSS [nesting selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Nesting_selector) (`&`) which allows for simplifying selector naming through reuse.

## BEM vs RSCSS vs KVCSS

We'll take a look at a BEM and an RSCSS implementation below using a small form. There are definitely better approaches to the HTML, but it'll suffice for the example.

Here's the form we'll recreate with each methodology. The layout and colors stay the same; only the way we organize and name the styles changes.

::: demo-result
@tab HTML

```html
<form>
  <div>
    <input type="checkbox" id="opt-in" name="opt-in" value="1" aria-describedby="opt-in-hint" />
    <label for="opt-in">Opt in</label>
    <p id="opt-in-hint">Receive occasional updates by email.</p>
  </div>
  <footer>
    <button type="submit">Submit</button>
  </footer>
</form>
```

@tab CSS

```css
form {
  border-radius: 1.25rem;
  background: var(--component-card-background-color);
  padding: 1rem;
  margin: 1rem;
}

form > div {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
}

label {
  font-weight: 600;
}

form p {
  grid-column: 2;
  margin-top: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

form footer {
  display: flex;
  justify-content: flex-start;
}

input[type="checkbox"] {
  appearance: none;
  display: grid;
  place-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  border: 1px solid var(--component-checkbox-border-color);
  color: var(--component-checkbox-label-base-color);
}

input[type="checkbox"]::before {
  content: "";
  width: 0.65rem;
  height: 0.65rem;
  background-color: currentColor;
  transform: scale(0);
}

input[type="checkbox"]:checked::before {
  transform: scale(1);
}

button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--component-base-button-secondary-border-color);
  border-radius: 0.25em;
  background-color: var(--component-base-button-secondary-background);
  color: var(--component-base-button-secondary-color);
  font: inherit;
  cursor: pointer;
}
```

@tab JavaScript

```js
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
});
```

:::

### BEM

The BEM version uses blocks, elements, and modifiers to describe the same form.

::: demo
@tab HTML

```html {1-2,4,10,14,20-21}
<form class="opt-in-form opt-in-form--compact">
  <div class="opt-in-form__field">
    <input
      class="check check--secondary"
      type="checkbox"
      id="opt-in"
      name="opt-in"
      value="1"
    />
    <label class="opt-in-form__label" for="opt-in">
      Opt in
    </label>
    <p
      class="opt-in-form__hint opt-in-form__hint--muted"
      id="opt-in-hint"
    >
      Receive occasional updates by email.
    </p>
  </div>
  <div class="opt-in-form__actions">
    <button class="btn btn--secondary" type="submit">
      Submit
    </button>
  </div>
</form>
```

@tab CSS

```css
/* Form block */
.opt-in-form {
  border-radius: 1.25rem;
  background: var(--component-card-background-color);
  padding: 1rem;
  margin: 1rem;
}

/* Block modifier */
.opt-in-form--compact {
  gap: 0.5rem;
}

/* Elements */
.opt-in-form__field {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
}

.opt-in-form__label {
  font-weight: 600;
}

.opt-in-form__hint {
  grid-column: 2;
  margin-top: 0;
  font-size: 0.875rem;
  color: var(--color-text-base);
}

/* Element modifier */
.opt-in-form__hint--muted {
  color: var(--color-text-muted);
}

.opt-in-form__actions {
  display: flex;
  justify-content: flex-start;
}

/* Independent checkbox block */
.check {
  appearance: none;
  display: grid;
  place-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  border: 1px solid currentColor;
  color: var(--color-text-base);
}

/* Checkbox block modifier */
.check--secondary {
  border-color: var(--component-checkbox-border-color);
  color: var(--component-checkbox-label-base-color);
}

.check::before {
  content: "";
  width: 0.65rem;
  height: 0.65rem;
  background-color: currentColor;
  transform: scale(0);
}

.check:checked::before {
  transform: scale(1);
}

/* Independent button block */
.btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--component-base-button-primary-border-color);
  border-radius: 0.25em;
  background-color: var(--component-base-button-primary-background);
  color: var(--component-base-button-primary-color);
  font: inherit;
  cursor: pointer;
}

/* Button block modifier */
.btn--secondary {
  border-color: var(--component-base-button-secondary-border-color);
  background-color: var(--component-base-button-secondary-background);
  color: var(--component-base-button-secondary-color);
}
```

:::

### RSCSS

The RSCSS version uses [component names](https://rstacruz.github.io/rscss/components.html), [scoped elements](https://rstacruz.github.io/rscss/elements.html), and [dash-prefixed variants](https://rstacruz.github.io/rscss/variants.html).

::: demo
@tab HTML

```html {1-2,4,10,14,20-21}
<form class="opt-in-form -compact">
  <div class="field">
    <input
      class="check-box -secondary"
      type="checkbox"
      id="opt-in"
      name="opt-in"
      value="1"
    />
    <label class="label" for="opt-in">
      Opt in
    </label>
    <p
      class="hint -muted"
      id="opt-in-hint"
    >
      Receive occasional updates by email.
    </p>
  </div>
  <div class="actions">
    <button class="base-button -secondary" type="submit">
      Submit
    </button>
  </div>
</form>
```

@tab CSS

```css
/* Form component */
.opt-in-form {
  border-radius: 1.25rem;
  background: var(--component-card-background-color);
  padding: 1rem;
  margin: 1rem;

  /* Component variant */
  &.-compact {
    gap: 0.5rem;
  }

  /* Elements */
  & > .field {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;

    & > .label {
      font-weight: 600;
    }

    & > .hint {
      grid-column: 2;
      margin-top: 0;
      font-size: 0.875rem;
      color: var(--color-text-base);

      /* Element variant */
      &.-muted {
        color: var(--color-text-muted);
      }
    }
  }

  & > .actions {
    display: flex;
    justify-content: flex-start;
  }
}

/* Independent checkbox component */
.check-box {
  appearance: none;
  display: grid;
  place-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  border: 1px solid currentColor;
  color: var(--color-text-base);

  /* Component variant */
  &.-secondary {
    border-color: var(--component-checkbox-border-color);
    color: var(--component-checkbox-label-base-color);
  }

  &::before {
    content: "";
    width: 0.65rem;
    height: 0.65rem;
    background-color: currentColor;
    transform: scale(0);
  }

  &:checked::before {
    transform: scale(1);
  }
}

/* Independent button component */
.base-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--component-base-button-primary-border-color);
  border-radius: 0.25em;
  background-color: var(--component-base-button-primary-background);
  color: var(--component-base-button-primary-color);
  font: inherit;
  cursor: pointer;

  /* Component variant */
  &.-secondary {
    border-color: var(--component-base-button-secondary-border-color);
    background-color: var(--component-base-button-secondary-background);
    color: var(--component-base-button-secondary-color);
  }
}
```
:::

You get the same ~88 lines of CSS and 25 lines of HTML between the two methodologies, but RSCSS is much easier to read in both HTML and in CSS. Some of that advantage is because decoupling the modifiers and variants from the element means that you can nest your selectors. But even if you didn't use nesting `.opt-in-form.-compact` is not much worse than `.opt-in-form--compact` as a CSS selector and `opt-in-form -compact` is still easier to read than `opt-in-form opt-in-form--compact` in an html class list.

Where I _don't_ like RSCSS is in its preference for child selectors for elements as a way to prevent classes from bleeding from one component to the next:

```css
.profile-box {
  > .firstname {
    /* ... */
  }
  > .lastname {
    /* ... */
  }
  > .avatar {
    /* ... */
  }
}
```

It also doesn't prefers to avoid tag selectors like `h2` or `input`. I like tag selectors because they have semantic meaning and can be valuable for making sure that you're authoring valid html, i.e. using `label` instead of `span.label`

### KVCSS

Now we have the new kid on the block. Key-value CSS. The main distinctions, or evolution, that it provides over RSCSS is:

1. It presumes you use `:scope` when defining components.
2. It prefers using elements/tags/attributes where they have semantic meaning
3. Class names are attribute-value pairs (or singletons for booleans)
4. It uses named slots.

So now, let's take a look at how we'd implement the form above using KVCSS.

::: demo
@tab HTML

```html
<form class="opt-in-form card -size-compact">
  <div slot="field">
    <input
      class="check-box -variant-secondary"
      type="checkbox"
      id="opt-in"
      name="opt-in"
      value="1"
    />
    <label for="opt-in"> Opt in </label>
    <p slot="hint" class="-color-muted" id="opt-in-hint">Receive occasional updates by email.</p>
  </div>
  <div slot="actions">
    <button class="base-button -variant-secondary" type="submit">Submit</button>
  </div>
</form>
```

@tab CSS

```css
/* Form component */
@scope (.card) {
  :scope {
    border-radius: 1.25rem;
    background: var(--component-card-background-color);
    padding: 1rem;
    margin: 1rem;

    /* Size modifier */
    &.-size-compact {
      gap: 0.5rem;
    }
  }

  div[slot="field"] {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
  }

  [slot="hint"] {
    grid-column: 2;
    margin-top: 0;
    font-size: 0.875rem;
    color: var(--color-text-base);

    /* Color modifier */
    &.-color-muted {
      color: var(--color-text-muted);
    }
  }

  [slot="actions"] {
    display: flex;
    justify-content: flex-start;
  }
}

/* Independent checkbox component */
@scope (input[type="checkbox"].check-box) {
  :scope {
    appearance: none;
    display: grid;
    place-content: center;
    width: 1.25rem;
    height: 1.25rem;
    margin: 0;
    border: 1px solid currentColor;
    color: var(--color-text-base);

    /* Variant modifier */
    &.-variant-secondary {
      border-color: var(--component-checkbox-border-color);
      color: var(--component-checkbox-label-base-color);
    }

    &::before {
      content: "";
      width: 0.65rem;
      height: 0.65rem;
      background-color: currentColor;
      transform: scale(0);
    }

    &:checked::before {
      transform: scale(1);
    }
  }
}

/* Independent button component */
@scope (button.base-button) {
  :scope {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--component-base-button-primary-border-color);
    border-radius: 0.25em;
    background-color: var(--component-base-button-primary-background);
    color: var(--component-base-button-primary-color);
    font: inherit;
    cursor: pointer;

    /* Variant modifier */
    &.-variant-secondary {
      border-color: var(--component-base-button-secondary-border-color);
      background-color: var(--component-base-button-secondary-background);
      color: var(--component-base-button-secondary-color);
    }
  }
}
```
:::

Now we have a tighter contract- only a button can be styled as a button, and only an actual checkbox input can get the checkbox styles. But any element can be a `card` component. You can couple this with `:is` for a focused set of elements. For example, let's say you wanted a heading component:

```css
@scope (:is(h1, h2, h3, h4, h5, h6).heading) {
  :scope {
    font-weight: 700;
    text-transform: capitalize;

    &.-color-muted {
      color: var(--color-text-muted);
    }
    &.-variant-subheading {
      font-size: smaller;
      text-transform: uppercase;
    }
  }
}
```

Here every heading element now has an opt-in `.heading` class, a muted color and a variant sub-heading.

Now, I will admit that this is more verbose than RSCSS `-color-muted` could just be `-muted`. But I like that but including the key or attribute name, you know what it's going to be affecting. Is `-muted` text? background? opacity? A `-variant` implies that there are several things that may be changing.

The second advantage, and this was purely a personal preference - is it made porting from react easier. Take for example this component:

```jsx
<StyledButton
  id={submitID}
  size="small"
  variant="secondary"
  withoutBorder
  icon={check}
  shape="square"
  margin="general.spaceMd"
>
  Submit
</StyledButton>
```

Authored with KVCSS it would look something like:

```html
<button
  id="submit"
  class="
    button
    -size-small
    -variant-secondary
    -without-border
    -icon-check
    -shape-square
    --margin-md
  "
>
  Submit
</button>
```

Which I think maintains a level of readability that you wouldn't get with RSCSS, and definitely wouldn't get with BEM.

One other thing to call out: global modifiers. Notice that the React margin comes from a general token that's available to any Component. The KVCSS answer to that is a `--` prefix: `--margin-md` instead of a single prefix. This does two things: it lets us define globals, but still override them if you want something more specific defined in your component. `-margin-md` beats `--margin-md` if you need it to.

The double-dash class name is valid CSS, and you can think of them like defining and using CSS vars.

Defining globals is the same as defining a component, it's just scoped to the `:root`:

```css
@scope (:root) {
  :scope {
    --margin-sm: { margin: 0.25rem; }
    --margin-md: { margin: 0.5rem; }
    --margin-lg: { margin: 0.75rem; };
  }
}
```

I find KVCSS to be extremely helpful when writing complex components with lots of configuration options. Pantoken's components are all written in KVCSS; check out the [alert](https://pantoken.app/api/css/alert) documentation and [code](https://github.com/thedannywahl/pantoken/blob/main/formats/components/src/components/alert/alert.css) to get a feel for it.
