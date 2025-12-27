@echo off
set PATH=%PATH%;C:\Program Files\nodejs;C:\Users\pc\AppData\Roaming\npm
npx prisma db push
npx prisma generate
