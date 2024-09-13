# mirrorTouhidurrr
A WebProxy built with Cloudflare Workers

## What does it do?
Visit mirrored sites via your domain / subdomain! It routes traffic of the sites you visit via mirror.touhidur.xyz and hides your IP and activities from the web. Any site you visit will appear to be mirror.touhidur.xyz to your ISP and the computers that are handling your requests worldwide. Kinda like Tor or VPN but in my opinion more secure.

## Features
1. No dependencies, pure Javascript.
2. Change links inside the page.
3. Handles relative links.
4. Partial support for JavaScript Parsing inside webpages.
5. Requests archive.org to archive the pages you visit, anonymously.
6. Completely Anonymous. No logging.
7. Supports Ad-Blockers. Only changes links within the same base domain.

## Build
Simply fork the project and host it with Cloudflare Pages. It should work out of the box.

## Anti-Features
1. Web apps and complex sites might break.
2. Video and audio might not work.
3. Sites without https might not work. The proxy tries to load pages in https: protocol only. Thus `http://` is not supported.

## Note
This project is a submission for the dev summer challenge of Cloudflare. So, pull requests will not be accepted until the event finishes. You may still pr, I might see them later.

*Dev Summer Challenge has ended! So, accepting pull requests now! Also, I got one of the swag boxes they were offering for the event!!*
