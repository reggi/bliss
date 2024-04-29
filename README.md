# Bliss

The philosophy around this project is kind of simple:

> Most interfaces can be build from two simple parts, `content`, `forms` and `lists of forms`.

It's the interplay between these three things that creats most modern interfaces, obviously there are edge cases, and specific uses, but most mobile apps, websitses, web apps, cli tools all abide by this same rule.

Why can't we go from this code:

```ts
function signup(opts: { username: string, password: string}) {
  // do the thing
}
```

* to a form
* to a react component
* to a webpage
* to a cli action

---

The current implementation is mainly designed to help the execution of "bin" or "cli" scripts.

By setting your ts files `shebang` to 

```ts
#!/usr/bin/env -S deno run -A jsr:@reggi/bliss@2.0.0/bin

/** @desc Logs a and b */
export default function example(
  /**
   * @desc Variable A
   */
  a: string,
  /**
   * @desc Variable B
   */
  b: string
) {
  console.log({ a, b });
}
```

You can then run `chmod +x ./script`
Then `./script.ts --help` will print:

```
  [example]  Logs a and b 
             --a  <string>  Variable A
             --b  <string>  Variable B
```

And `./script.ts --a "hello" --b "world"` will print:

```
{ a: "hello", b: "world" }
```

---

# Phase one: functions

As the above example, `functions` are phase one.

# Phase two: classes

Alasses are not yet implement, and are more advanced.

In order for apps to have "connectivity" and manage state, auth, etc classes are a great in-code way to scaffold how an app works internally.

Start with a type, which is usually a noun.

Let's say its a JWT for auth, lets call it a session.

```ts
class Session {
  constructor (public value: JWT) {}
}
```

Now the idea is that all `static` methods arrive at ways to generate a session, and all non-static `members` are actions you can do with a `session`.

```ts
class Session {
  constructor (public value: JWT) {}

  static login (opts: { username: string, password: string}) {
    cosnt jwt = '' // do the op
    return new Session(jwt)
  }

  static signup (opts: { username: string, password: string}) {
    cosnt jwt = '' // do the op
    return new Session(jwt)
  }

  changeEmail (email: string) {
    // do the op
  }

  chagnePassword (currentPassword: string, newPassword: string) {
    // do the op
  }
}
```

This translates into several "pages".

List of things to do at start, when not authed:

```
login
signup
```

When authed:

```
changeEmail
chagnePassword
```

And each "page" has as a form on it that "leads" to another page.