# Use the latest Node.js image as the base image
FROM node:22.14.0

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN yarn

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN yarn build

# export port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]