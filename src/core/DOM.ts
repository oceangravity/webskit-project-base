export default class DOM {
  value: any[] = [];
  constructor(s: string | { [p: string]: never }, context: Document | HTMLElement | ShadowRoot | undefined) {
    if (typeof s === "string") {
      this.value = context ? Array.prototype.slice.call(context.querySelectorAll(s)) : [];
    }
    if (typeof s === "object") {
      this.value = [s];
    }
  }

  eq(n: any) {
    this.value = [this.value[n]];
    return this;
  }

  each(fn: any) {
    [].forEach.call(this.value, fn);
    return this;
  }

  css(v: string) {
    return this.each(function (i: any) {
      i.style.cssText = i.style.cssText + v;
    });
  }

  cssdom(v: any) {
    return this.each(function (i: any) {
      for (const key in v) {
        if (Object.prototype.hasOwnProperty.call(v, key)) {
          i.style[key] = v[key];
        }
      }
    });
  }

  show() {
    return this.css("display: block");
  }

  hide() {
    return this.css("display: none");
  }

  attr(a: any, v: any) {
    return this.each(function (i: any) {
      try {
        i.setAttribute(a, v);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    });
  }

  getAttr(v: any) {
    return this.value[0].getAttribute(v);
  }

  removeAttr(v: any) {
    return this.each(function (i: any) {
      i.removeAttribute(v);
    });
  }

  animate(time: string, scale: string, rotate: string, rotateX: string, rotateY: string, translateX: string, translateY: string, skewX: string, skewY: string, opacity: string) {
    return this.each(function (i: any) {
      i.style.cssText = i.style.cssText + "transition: all " + time + "s ease-in-out; transform: scale(" + scale + ") rotate(" + rotate + "deg) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translate(" + translateX + "px, " + translateY + "px) skew(" + skewX + "deg, " + skewY + "deg); opacity:" + opacity + ";";
    });
  }

  on(type: any, fn: void) {
    return this.each(function (i: any) {
      i.addEventListener(type, fn, false);
    });
  }

  addClass(v: string) {
    return this.each(function (i: HTMLElement) {
      if (i.classList) {
        i.classList.add(v);
      } else {
        i.className += " " + v;
      }
    });
  }

  toggleClass(v: string) {
    return this.each(function (i: HTMLElement) {
      i.classList.toggle(v);
    });
  }

  removeClass(v: string) {
    return this.each(function (i: HTMLElement) {
      i.classList.remove(v);
    });
  }

  html(v: string) {
    return this.each(function (i: HTMLElement) {
      i.innerHTML = v;
    });
  }

  text(v: string) {
    return this.each(function (i: HTMLElement) {
      i.innerText = v;
    });
  }

  insertBefore(v: string) {
    return this.each(function (i: HTMLElement) {
      i.insertAdjacentHTML(<"beforebegin" | "afterbegin" | "beforeend" | "afterend">"beforeBegin", v);
    });
  }

  insertAfter(v: string) {
    return this.each(function (i: HTMLElement) {
      i.insertAdjacentHTML(<"beforebegin" | "afterbegin" | "beforeend" | "afterend">"afterEnd", v);
    });
  }

  insertFirst(v: string) {
    return this.each(function (i: HTMLElement) {
      i.insertAdjacentHTML(<"beforebegin" | "afterbegin" | "beforeend" | "afterend">"afterBegin", v);
    });
  }

  insertLast(v: string) {
    return this.each(function (i: HTMLElement) {
      i.insertAdjacentHTML(<"beforebegin" | "afterbegin" | "beforeend" | "afterend">"beforeEnd", v);
    });
  }

  empty() {
    return this.each(function (i: HTMLElement) {
      i.innerHTML = "";
    });
  }

  parent() {
    this.value = [this.value[0].parentNode];
    return this;
  }

  siblings() {
    this.value = Array.prototype.filter.call(this.value[0].parentNode.children, (child) => child !== this.value[0]);
    return this;
  }

  log() {
    console.log(this);
  }
}
