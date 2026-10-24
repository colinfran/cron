# Cron

My personal console for scheduling jobs and keeping things running on time.
Built with Next.js, PostgreSQL, and shadcn/ui for my own infrastructure and
workflows.

## Features

- Run scheduled HTTP requests and reminders.
- Track scheduled job execution history and failed runs.
- Send reminder notifications through configured alert channels.
- Manage scheduled jobs and notification channels in a single workspace per user.
- Use owner-only GitHub authentication, with no public registration or password
  sign-in.
- Use a redesigned interface with neutral light and dark themes.

## Origin and modifications

Cron is a substantially modified version of
[CronPulse](https://github.com/AneeshaRama/cronpulse), not an official CronPulse
release.

Changes include renaming the application to Cron, redesigning the user interface,
removing unneeded functionality, adding and modifying features, customizing
authentication and access control, and adapting integrations for my personal
infrastructure.

This is a personal-use project. That describes its intended use and maintenance,
not a restriction on anyone else's rights under the license.

## License and attribution

Cron is licensed under the GNU Affero General Public License, version 3
(AGPL-3.0), the verified license of the original CronPulse project. See the
complete [LICENSE](./LICENSE) and the modification and attribution notices in
[NOTICE.md](./NOTICE.md).

Third-party components retain their respective licenses. The AGPL permits use,
modification, and redistribution subject to its terms.
