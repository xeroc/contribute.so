export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
  }
  private: boolean
  html_url: string
  description: string | null
}

export async function fetchUserRepositories(accessToken: string): Promise<GitHubRepo[]> {
  const response = await fetch('https://api.github.com/user/repos?type=owner&sort=updated&per_page=100', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories: ${response.statusText}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const repos: GitHubRepo[] = await response.json()

  // Filter only public repositories owned by the user
  return repos.filter((repo) => !repo.private)
}
