# 1. Base Image for dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --frozen-lockfile


# 2. Builder stage: Build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application for production
RUN npm run build


# 3. Runner stage: Create the final, optimized image
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production
ENV NODE_ENV production
# Disable telemetry in production
ENV NEXT_TELEMETRY_DISABLED 1
# Set the port the app will run on
ENV PORT 9002

# Create a non-root user and group for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone Next.js server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the public and static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 9002

# Start the Node.js server
CMD ["node", "server.js"]
