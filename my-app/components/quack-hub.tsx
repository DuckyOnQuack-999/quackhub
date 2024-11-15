'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Octokit } from "@octokit/rest"
import { Code, FileText, Github, Loader2, Search, Terminal, Sun, Moon, X, Send, ChevronLeft, ChevronRight, ExternalLink, Twitter, Linkedin, Calendar, Star, GitFork, Eye, Menu, PenToolIcon as Tool, Layers, Play, Book, Activity, MessageSquare, Info, Settings, GitPullRequest, GitMerge, AlertCircle, Award, Globe } from 'lucide-react'
import { useTheme } from "next-themes"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useInView } from 'react-intersection-observer'
import GitHubCalendar from 'react-github-calendar'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"
import {
Tabs,
TabsContent,
TabsList,
TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
Sheet,
SheetContent,
SheetDescription,
SheetHeader,
SheetTitle,
SheetTrigger,
} from "@/components/ui/sheet"
import {
Tooltip,
TooltipContent,
TooltipProvider,
TooltipTrigger,
} from "@/components/ui/tooltip"
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from 'react-i18next'
import { Sandpack } from "@codesandbox/sandpack-react"

type Repository = {
id: number
name: string
description: string
language: string
stargazers_count: number
forks_count: number
watchers_count: number
topics: string[]
full_name: string
html_url: string
homepage: string | null
updated_at: string
open_issues_count: number
default_branch: string
created_at: string
pushed_at: string
size: number
contributors_url: string
languages_url: string
commits_url: string
}

type UserData = {
name: string
bio: string
avatar_url: string
login: string
public_repos: number
followers: number
following: number
public_gists: number
created_at: string
updated_at: string
location: string
company: string
blog: string
twitter_username: string
organizations_url: string
}

type Activity = {
id: string
type: string
created_at: string
repo: {
  name: string
  url: string
}
payload: any
}

type BlogPost = {
title: string
date: string
url: string
excerpt: string
}

type Gist = {
id: string
description: string
html_url: string
files: {
  [filename: string]: {
    language: string
    raw_url: string
    size: number
    content: string
  }
}
}

type PullRequest = {
id: number
title: string
html_url: string
state: string
created_at: string
updated_at: string
closed_at: string | null
merged_at: string | null
user: {
  login: string
  avatar_url: string
}
}

type Issue = {
id: number
title: string
html_url: string
state: string
created_at: string
updated_at: string
closed_at: string | null
user: {
  login: string
  avatar_url: string
}
}

type Contributor = {
login: string
avatar_url: string
contributions: number
}

type Language = {
name: string
size: number
}

type Commit = {
sha: string
commit: {
  author: {
    date: string
  }
}
}

type Organization = {
login: string
avatar_url: string
description: string
}

type WorkflowRun = {
id: number
name: string
status: string
conclusion: string
created_at: string
}

type Achievement = {
title: string
description: string
icon: React.ReactNode
}

const octokit = new Octokit()

export function QuackHubComponent() {
const { t, i18n } = useTranslation()
const [loading, setLoading] = React.useState({
  user: true,
  repos: true,
  readme: false,
  gists: true,
  pullRequests: true,
  issues: true,
  contributors: true,
  languages: true,
  commits: true,
  organizations: true,
  workflowRuns: true,
})
const [error, setError] = React.useState<string | null>(null)
const [userData, setUserData] = React.useState<UserData | null>(null)
const [repos, setRepos] = React.useState<Repository[]>([])
const [filteredRepos, setFilteredRepos] = React.useState<Repository[]>([])
const [selectedRepo, setSelectedRepo] = React.useState<Repository | null>(null)
const [readmeContent, setReadmeContent] = React.useState("")
const [searchQuery, setSearchQuery] = React.useState("")
const [profileReadme, setProfileReadme] = React.useState("")
const [skills, setSkills] = React.useState<Record<string, number>>({})
const [activities, setActivities] = React.useState<Activity[]>([])
const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([])
const [languageStats, setLanguageStats] = React.useState<Record<string, number>>({})
const [currentPage, setCurrentPage] = React.useState(1)
const [sortOption, setSortOption] = React.useState("stars")
const { theme, setTheme } = useTheme()
const [isLeftPanelOpen, setIsLeftPanelOpen] = React.useState(false)
const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false)
const [activeTab, setActiveTab] = React.useState("repositories")
const [gists, setGists] = React.useState<Gist[]>([])
const [pullRequests, setPullRequests] = React.useState<PullRequest[]>([])
const [issues, setIssues] = React.useState<Issue[]>([])
const [contributionData, setContributionData] = React.useState<any>(null)
const [selectedLanguageFilter, setSelectedLanguageFilter] = React.useState<string | null>(null)
const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] = React.useState(true)
const [contributors, setContributors] = React.useState<Contributor[]>([])
const [languages, setLanguages] = React.useState<Language[]>([])
const [commits, setCommits] = React.useState<Commit[]>([])
const [organizations, setOrganizations] = React.useState<Organization[]>([])
const [workflowRuns, setWorkflowRuns] = React.useState<WorkflowRun[]>([])
const [achievements, setAchievements] = React.useState<Achievement[]>([])
const [selectedDateRange, setSelectedDateRange] = React.useState<[Date, Date]>([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()])
const [savedSearches, setSavedSearches] = React.useState<string[]>([])
const [isHighContrastMode, setIsHighContrastMode] = React.useState(false)
const [language, setLanguage] = React.useState('en')

const reposPerPage = 9
const totalPages = Math.ceil(filteredRepos.length / reposPerPage)

const { ref, inView } = useInView({
  threshold: 0,
  triggerOnce: false,
})

const fetchGitHubData = React.useCallback(async () => {
  try {
    setLoading(prev => ({ ...prev, user: true, repos: true, gists: true, pullRequests: true, issues: true, contributors: true, languages: true, commits: true, organizations: true, workflowRuns: true }))
    setError(null)

    const [userResponse, reposResponse, eventsResponse, gistsResponse, organizationsResponse] = await Promise.all([
      octokit.users.getByUsername({ username: "DuckyOnQuack-999" }),
      octokit.repos.listForUser({ username: "DuckyOnQuack-999", per_page: 100 }),
      octokit.activity.listPublicEventsForUser({ username: "DuckyOnQuack-999" }),
      octokit.gists.listForUser({ username: "DuckyOnQuack-999" }),
      octokit.orgs.listForUser({ username: "DuckyOnQuack-999" })
    ])

    setUserData(userResponse.data)
    setRepos(reposResponse.data)
    setFilteredRepos(reposResponse.data)
    setActivities(eventsResponse.data.slice(0, 10))
    setGists(gistsResponse.data)
    setOrganizations(organizationsResponse.data)

    const skillsObj: Record<string, number> = {}
    const langStatsObj: Record<string, number> = {}
    reposResponse.data.forEach(repo => {
      if (repo.language) {
        skillsObj[repo.language] = (skillsObj[repo.language] || 0) + 1
        langStatsObj[repo.language] = (langStatsObj[repo.language] || 0) + repo.size
      }
    })
    setSkills(skillsObj)
    setLanguageStats(langStatsObj)

    try {
      const readmeResponse = await octokit.repos.getReadme({
        owner: "DuckyOnQuack-999",
        repo: "DuckyOnQuack-999"
      })
      setProfileReadme(atob(readmeResponse.data.content))
    } catch (error) {
      console.error("Error fetching profile README:", error)
      setProfileReadme("No profile README available")
    }

    // Fetch pull requests and issues
    const pullRequestsPromises = reposResponse.data.slice(0, 5).map(repo =>
      octokit.pulls.list({ owner: "DuckyOnQuack-999", repo: repo.name, state: "all" })
    )
    const issuesPromises = reposResponse.data.slice(0, 5).map(repo =>
      octokit.issues.listForRepo({ owner: "DuckyOnQuack-999", repo: repo.name, state: "all" })
    )

    const pullRequestsResponses = await Promise.all(pullRequestsPromises)
    const issuesResponses = await Promise.all(issuesPromises)

    const allPullRequests = pullRequestsResponses.flatMap(response => response.data)
    const allIssues = issuesResponses.flatMap(response => response.data)

    setPullRequests(allPullRequests)
    setIssues(allIssues)

    // Fetch contribution data
    const contributionResponse = await fetch(`https://github-contributions-api.jogruber.de/v4/DuckyOnQuack-999`)
    const contributionData = await contributionResponse.json()
    setContributionData(contributionData)

    // Fetch blog posts (simulated)
    setBlogPosts([
      { 
        title: "Understanding React Hooks", 
        date: "2023-06-01", 
        url: "#",
        excerpt: "React Hooks are a powerful feature that allow you to use state and other React features without writing a class..."
      },
      { 
        title: "Building Scalable Node.js Applications", 
        date: "2023-05-15", 
        url: "#",
        excerpt: "Scalability is crucial when building Node.js applications. In this post, we'll explore best practices for creating scalable architectures..."
      },
      { 
        title: "The Future of TypeScript", 
        date: "2023-04-30", 
        url: "#",
        excerpt: "TypeScript continues to evolve, bringing new features and improvements. Let's take a look at what the future holds for TypeScript..."
      },
    ])

    // Fetch additional data for the first repository
    if (reposResponse.data.length > 0) {
      const firstRepo = reposResponse.data[0]
      const [contributorsResponse, languagesResponse, commitsResponse, workflowRunsResponse] = await Promise.all([
        octokit.repos.listContributors({ owner: "DuckyOnQuack-999", repo: firstRepo.name }),
        octokit.repos.listLanguages({ owner: "DuckyOnQuack-999", repo: firstRepo.name }),
        octokit.repos.listCommits({ owner: "DuckyOnQuack-999", repo: firstRepo.name }),
        octokit.actions.listWorkflowRunsForRepo({ owner: "DuckyOnQuack-999", repo: firstRepo.name })
      ])

      setContributors(contributorsResponse.data)
      setLanguages(Object.entries(languagesResponse.data).map(([name, size]) => ({ name, size })))
      setCommits(commitsResponse.data)
      setWorkflowRuns(workflowRunsResponse.data.workflow_runs)
    }

    // Set achievements (simulated)
    setAchievements([
      { title: "100 Days Streak", description: "Contributed code for 100 days in a row", icon: <Calendar className="w-6 h-6" /> },
      { title: "1000 Commits", description: "Reached 1000 total commits", icon: <GitMerge className="w-6 h-6" /> },
      { title: "Open Source Hero", description: "Contributed to 10+ open source projects", icon: <Star className="w-6 h-6" /> },
    ])

  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    setError("Failed to fetch GitHub data. Please try again later.")
    toast({
      title: "Error",
      description: "Failed to fetch GitHub data. Please try again later.",
      variant: "destructive",
    })
  } finally {
    setLoading(prev => ({ ...prev, user: false, repos: false, gists: false, pullRequests: false, issues: false, contributors: false, languages: false, commits: false, organizations: false, workflowRuns: false }))
  }
}, [])

React.useEffect(() => {
  fetchGitHubData()

  const intervalId = setInterval(fetchGitHubData, 300000) // Refresh every 5 minutes
  return () => clearInterval(intervalId)
}, [fetchGitHubData])

React.useEffect(() => {
  let filtered = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedLanguageFilter || repo.language === selectedLanguageFilter) &&
    new Date(repo.created_at) >= selectedDateRange[0] &&
    new Date(repo.created_at) <= selectedDateRange[1]
  )

  switch (sortOption) {
    case "stars":
      filtered.sort((a, b) => b.stargazers_count - a.stargazers_count)
      break
    case "updated":
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      break
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "issues":
      filtered.sort((a, b) => b.open_issues_count - a.open_issues_count)
      break
  }

  setFilteredRepos(filtered)
  setCurrentPage(1)
}, [searchQuery, repos, sortOption, selectedLanguageFilter, selectedDateRange])

const fetchReadme = async (fullName: string) => {
  try {
    setLoading(prev => ({ ...prev, readme: true }))
    const response = await octokit.repos.getReadme({ owner: "DuckyOnQuack-999", repo: fullName.split('/')[1] })
    const decodedContent = atob(response.data.content)
    setReadmeContent(decodedContent)
  } catch (error) {
    console.error("Error fetching README:", error)
    setReadmeContent("No README available")
    toast({
      title: "Error",
      description: "Failed to fetch README. The repository might not have a README file.",
      variant: "destructive",
    })
  } finally {
    setLoading(prev => ({ ...prev, readme: false }))
  }
}

const paginatedRepos = filteredRepos.slice(
  0,
  currentPage * reposPerPage
)

React.useEffect(() => {
  if (inView && isInfiniteScrollEnabled && currentPage < totalPages) {
    setCurrentPage(prev => prev + 1)
  }
}, [inView, isInfiniteScrollEnabled, currentPage, totalPages])

const ErrorFallback = ({ error, resetErrorBoundary }: { error: { message: string }, resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
    <Card className="bg-neutral-900/50 border-neutral-800 p-6 glow-card">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h2>
      <p className="text-neutral-400 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary} className="bg-red-500 hover:bg-red-600 text-white glow-button">
        Try again
      </Button>
    </Card>
  </div>
)

const LeftPanel = () => (
  <Sheet open={isLeftPanelOpen} onOpenChange={setIsLeftPanelOpen}>
    <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-neutral-900 border-r border-neutral-800">
      <SheetHeader>
        <SheetTitle className="text-red-500">{t('navigation')}</SheetTitle>
      </SheetHeader>
      <nav className="mt-6 space-y-4">
        <Link href="#repositories" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("repositories")}}>
          <Code className="w-5 h-5 mr-2" />
          {t('repositories')}
        </Link>
        <Link href="#projects" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("projects")}}>
          <Layers className="w-5 h-5 mr-2" />
          {t('projects')}
        </Link>
        <Link href="#docs" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("docs")}}>
          <FileText className="w-5 h-5 mr-2" />
          {t('docs')}
        </Link>
        <Link href="#apps" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("apps")}}>
          <Play className="w-5 h-5 mr-2" />
          {t('apps')}
        </Link>
        <Link href="#activity" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("activity")}}>
          <Calendar className="w-5 h-5 mr-2" />
          {t('activity')}
        </Link>
        <Link href="#gists" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("gists")}}>
          <FileText className="w-5 h-5 mr-2" />
          {t('gists')}
        </Link>
        <Link href="#pullrequests" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("pullrequests")}}>
          <GitPullRequest className="w-5 h-5 mr-2" />
          {t('pullRequests')}
        </Link>
        <Link href="#issues" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("issues")}}>
          <AlertCircle className="w-5 h-5 mr-2" />
          {t('issues')}
        </Link>
        <Link href="#achievements" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("achievements")}}>
          <Award className="w-5 h-5 mr-2" />
          {t('achievements')}
        </Link>
      </nav>
    </SheetContent>
  </Sheet>
)

const RightPanel = () => (
  <Sheet open={isRightPanelOpen} onOpenChange={setIsRightPanelOpen}>
    <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-neutral-900 border-l border-neutral-800">
      <SheetHeader>
        <SheetTitle className="text-red-500">{t('tools')}</SheetTitle>
        <SheetDescription>{t('toolsDescription')}</SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-4">
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('analyzeRepository')}
        </Button>
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('generateDocumentation')}
        </Button>
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('codeQualityCheck')}
        </Button>
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('dependencyAudit')}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
)

const LanguageChart = () => {
  const data = Object.entries(languageStats).map(([name, value]) => ({ name, value }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
          ))}
        </Pie>
        <RechartsTooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

const CommitActivityChart = () => {
  const commitData = commits.map(commit => ({
    date: new Date(commit.commit.author.date).toLocaleDateString(),
    commits: 1
  }))

  const aggregatedData = commitData.reduce((acc, { date, commits }) => {
    acc[date] = (acc[date] || 0) + commits
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(aggregatedData).map(([date, commits]) => ({ date, commits }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <RechartsTooltip />
        <Line type="monotone" dataKey="commits" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}

const SkillsVisualization = () => {
  const skillsArray = Object.entries(skills).sort((a, b) => b[1] - a[1])
  const maxValue = Math.max(...skillsArray.map(([_, value]) => value))

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {skillsArray.map(([skill, value]) => (
        <div key={skill} className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-red-400 mb-2">{skill}</h4>
          <div className="w-full bg-neutral-700 rounded-full h-2.5">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: `${(value / maxValue) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-neutral-400 mt-1">{value} repositories</p>
        </div>
      ))}
    </div>
  )
}

if (error) {
  return <ErrorFallback error={{ message: error }} resetErrorBoundary={fetchGitHubData} />
}

return (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className={`min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden ${isHighContrastMode ? 'high-contrast' : ''}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-purple-900/10 animate-gradient-shift"></div>
    <div className="relative z-10">
      <header className="bg-[#0D0D0D] border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Github className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-xl font-bold text-white">QuackHub</h1>
                <p className="text-sm text-neutral-400">{t('subtitle')}</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("repositories")}>
                <Code className="h-4 w-4 mr-2" />
                {t('repositories')}
              </Button>
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("projects")}>
                <Layers className="h-4 w-4 mr-2" />
                {t('projects')}
              </Button>
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("docs")}>
                <FileText className="h-4 w-4 mr-2" />
                {t('docs')}
              </Button>
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("apps")}>
                <Play className="h-4 w-4 mr-2" />
                {t('apps')}
              </Button>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hidden md:flex">
                {t('quackLabsSolutions')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="bg-transparent border-neutral-800"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t('toggleTheme')}</span>
              </Button>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLeftPanelOpen(true)}
                className="md:hidden text-neutral-400 hover:text-white"
                aria-label={t('openNavigCertainly, I'll carefully analyze all versions to implement what may have been removed or left out. Let's go through this process step by step.



After careful analysis, I've identified several features that were present in previous versions but may have been omitted in the most recent implementation. I'll now provide an updated version of the QuackHubComponent component that incorporates these features while maintaining the improvements we've already made.

```tsx project="QuackHub" file="quack-hub.tsx" type="react"
'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Octokit } from "@octokit/rest"
import { Code, FileText, Github, Loader2, Search, Terminal, Sun, Moon, X, Send, ChevronLeft, ChevronRight, ExternalLink, Twitter, Linkedin, Calendar, Star, GitFork, Eye, Menu, PenToolIcon as Tool, Layers, Play, Book, Activity, MessageSquare, Info, Settings, GitPullRequest, GitMerge, AlertCircle, Award, Globe } from 'lucide-react'
import { useTheme } from "next-themes"
import ReactMarkdown from 'react-markdown'
import Link from "next/link"
import { useInView } from 'react-intersection-observer'
import GitHubCalendar from 'react-github-calendar'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"
import {
Tabs,
TabsContent,
TabsList,
TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
Sheet,
SheetContent,
SheetDescription,
SheetHeader,
SheetTitle,
SheetTrigger,
} from "@/components/ui/sheet"
import {
Tooltip,
TooltipContent,
TooltipProvider,
TooltipTrigger,
} from "@/components/ui/tooltip"
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from 'react-i18next'
import { Sandpack } from "@codesandbox/sandpack-react"

type Repository = {
id: number
name: string
description: string
language: string
stargazers_count: number
forks_count: number
watchers_count: number
topics: string[]
full_name: string
html_url: string
homepage: string | null
updated_at: string
open_issues_count: number
default_branch: string
created_at: string
pushed_at: string
size: number
contributors_url: string
languages_url: string
commits_url: string
}

type UserData = {
name: string
bio: string
avatar_url: string
login: string
public_repos: number
followers: number
following: number
public_gists: number
created_at: string
updated_at: string
location: string
company: string
blog: string
twitter_username: string
organizations_url: string
}

type Activity = {
id: string
type: string
created_at: string
repo: {
  name: string
  url: string
}
payload: any
}

type BlogPost = {
title: string
date: string
url: string
excerpt: string
}

type Gist = {
id: string
description: string
html_url: string
files: {
  [filename: string]: {
    language: string
    raw_url: string
    size: number
    content: string
  }
}
}

type PullRequest = {
id: number
title: string
html_url: string
state: string
created_at: string
updated_at: string
closed_at: string | null
merged_at: string | null
user: {
  login: string
  avatar_url: string
}
}

type Issue = {
id: number
title: string
html_url: string
state: string
created_at: string
updated_at: string
closed_at: string | null
user: {
  login: string
  avatar_url: string
}
}

type Contributor = {
login: string
avatar_url: string
contributions: number
}

type Language = {
name: string
size: number
}

type Commit = {
sha: string
commit: {
  author: {
    date: string
  }
}
}

type Organization = {
login: string
avatar_url: string
description: string
}

type WorkflowRun = {
id: number
name: string
status: string
conclusion: string
created_at: string
}

type Achievement = {
title: string
description: string
icon: React.ReactNode
}

const octokit = new Octokit()

export default function QuackHub() {
const { t, i18n } = useTranslation()
const [loading, setLoading] = React.useState({
  user: true,
  repos: true,
  readme: false,
  gists: true,
  pullRequests: true,
  issues: true,
  contributors: true,
  languages: true,
  commits: true,
  organizations: true,
  workflowRuns: true,
})
const [error, setError] = React.useState<string | null>(null)
const [userData, setUserData] = React.useState<UserData | null>(null)
const [repos, setRepos] = React.useState<Repository[]>([])
const [filteredRepos, setFilteredRepos] = React.useState<Repository[]>([])
const [selectedRepo, setSelectedRepo] = React.useState<Repository | null>(null)
const [readmeContent, setReadmeContent] = React.useState("")
const [searchQuery, setSearchQuery] = React.useState("")
const [profileReadme, setProfileReadme] = React.useState("")
const [skills, setSkills] = React.useState<Record<string, number>>({})
const [activities, setActivities] = React.useState<Activity[]>([])
const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([])
const [languageStats, setLanguageStats] = React.useState<Record<string, number>>({})
const [currentPage, setCurrentPage] = React.useState(1)
const [sortOption, setSortOption] = React.useState("stars")
const { theme, setTheme } = useTheme()
const [isLeftPanelOpen, setIsLeftPanelOpen] = React.useState(false)
const [isRightPanelOpen, setIsRightPanelOpen] = React.useState(false)
const [activeTab, setActiveTab] = React.useState("repositories")
const [gists, setGists] = React.useState<Gist[]>([])
const [pullRequests, setPullRequests] = React.useState<PullRequest[]>([])
const [issues, setIssues] = React.useState<Issue[]>([])
const [contributionData, setContributionData] = React.useState<any>(null)
const [selectedLanguageFilter, setSelectedLanguageFilter] = React.useState<string | null>(null)
const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] = React.useState(true)
const [contributors, setContributors] = React.useState<Contributor[]>([])
const [languages, setLanguages] = React.useState<Language[]>([])
const [commits, setCommits] = React.useState<Commit[]>([])
const [organizations, setOrganizations] = React.useState<Organization[]>([])
const [workflowRuns, setWorkflowRuns] = React.useState<WorkflowRun[]>([])
const [achievements, setAchievements] = React.useState<Achievement[]>([])
const [selectedDateRange, setSelectedDateRange] = React.useState<[Date, Date]>([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()])
const [savedSearches, setSavedSearches] = React.useState<string[]>([])
const [isHighContrastMode, setIsHighContrastMode] = React.useState(false)
const [language, setLanguage] = React.useState('en')

const reposPerPage = 9
const totalPages = Math.ceil(filteredRepos.length / reposPerPage)

const { ref, inView } = useInView({
  threshold: 0,
  triggerOnce: false,
})

const fetchGitHubData = React.useCallback(async () => {
  try {
    setLoading(prev => ({ ...prev, user: true, repos: true, gists: true, pullRequests: true, issues: true, contributors: true, languages: true, commits: true, organizations: true, workflowRuns: true }))
    setError(null)

    const [userResponse, reposResponse, eventsResponse, gistsResponse, organizationsResponse] = await Promise.all([
      octokit.users.getByUsername({ username: "DuckyOnQuack-999" }),
      octokit.repos.listForUser({ username: "DuckyOnQuack-999", per_page: 100 }),
      octokit.activity.listPublicEventsForUser({ username: "DuckyOnQuack-999" }),
      octokit.gists.listForUser({ username: "DuckyOnQuack-999" }),
      octokit.orgs.listForUser({ username: "DuckyOnQuack-999" })
    ])

    setUserData(userResponse.data)
    setRepos(reposResponse.data)
    setFilteredRepos(reposResponse.data)
    setActivities(eventsResponse.data.slice(0, 10))
    setGists(gistsResponse.data)
    setOrganizations(organizationsResponse.data)

    const skillsObj: Record<string, number> = {}
    const langStatsObj: Record<string, number> = {}
    reposResponse.data.forEach(repo => {
      if (repo.language) {
        skillsObj[repo.language] = (skillsObj[repo.language] || 0) + 1
        langStatsObj[repo.language] = (langStatsObj[repo.language] || 0) + repo.size
      }
    })
    setSkills(skillsObj)
    setLanguageStats(langStatsObj)

    try {
      const readmeResponse = await octokit.repos.getReadme({
        owner: "DuckyOnQuack-999",
        repo: "DuckyOnQuack-999"
      })
      setProfileReadme(atob(readmeResponse.data.content))
    } catch (error) {
      console.error("Error fetching profile README:", error)
      setProfileReadme("No profile README available")
    }

    // Fetch pull requests and issues
    const pullRequestsPromises = reposResponse.data.slice(0, 5).map(repo =>
      octokit.pulls.list({ owner: "DuckyOnQuack-999", repo: repo.name, state: "all" })
    )
    const issuesPromises = reposResponse.data.slice(0, 5).map(repo =>
      octokit.issues.listForRepo({ owner: "DuckyOnQuack-999", repo: repo.name, state: "all" })
    )

    const pullRequestsResponses = await Promise.all(pullRequestsPromises)
    const issuesResponses = await Promise.all(issuesPromises)

    const allPullRequests = pullRequestsResponses.flatMap(response => response.data)
    const allIssues = issuesResponses.flatMap(response => response.data)

    setPullRequests(allPullRequests)
    setIssues(allIssues)

    // Fetch contribution data
    const contributionResponse = await fetch(`https://github-contributions-api.jogruber.de/v4/DuckyOnQuack-999`)
    const contributionData = await contributionResponse.json()
    setContributionData(contributionData)

    // Fetch blog posts (simulated)
    setBlogPosts([
      { 
        title: "Understanding React Hooks", 
        date: "2023-06-01", 
        url: "#",
        excerpt: "React Hooks are a powerful feature that allow you to use state and other React features without writing a class..."
      },
      { 
        title: "Building Scalable Node.js Applications", 
        date: "2023-05-15", 
        url: "#",
        excerpt: "Scalability is crucial when building Node.js applications. In this post, we'll explore best practices for creating scalable architectures..."
      },
      { 
        title: "The Future of TypeScript", 
        date: "2023-04-30", 
        url: "#",
        excerpt: "TypeScript continues to evolve, bringing new features and improvements. Let's take a look at what the future holds for TypeScript..."
      },
    ])

    // Fetch additional data for the first repository
    if (reposResponse.data.length > 0) {
      const firstRepo = reposResponse.data[0]
      const [contributorsResponse, languagesResponse, commitsResponse, workflowRunsResponse] = await Promise.all([
        octokit.repos.listContributors({ owner: "DuckyOnQuack-999", repo: firstRepo.name }),
        octokit.repos.listLanguages({ owner: "DuckyOnQuack-999", repo: firstRepo.name }),
        octokit.repos.listCommits({ owner: "DuckyOnQuack-999", repo: firstRepo.name }),
        octokit.actions.listWorkflowRunsForRepo({ owner: "DuckyOnQuack-999", repo: firstRepo.name })
      ])

      setContributors(contributorsResponse.data)
      setLanguages(Object.entries(languagesResponse.data).map(([name, size]) => ({ name, size })))
      setCommits(commitsResponse.data)
      setWorkflowRuns(workflowRunsResponse.data.workflow_runs)
    }

    // Set achievements (simulated)
    setAchievements([
      { title: "100 Days Streak", description: "Contributed code for 100 days in a row", icon: <Calendar className="w-6 h-6" /> },
      { title: "1000 Commits", description: "Reached 1000 total commits", icon: <GitMerge className="w-6 h-6" /> },
      { title: "Open Source Hero", description: "Contributed to 10+ open source projects", icon: <Star className="w-6 h-6" /> },
    ])

  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    setError("Failed to fetch GitHub data. Please try again later.")
    toast({
      title: "Error",
      description: "Failed to fetch GitHub data. Please try again later.",
      variant: "destructive",
    })
  } finally {
    setLoading(prev => ({ ...prev, user: false, repos: false, gists: false, pullRequests: false, issues: false, contributors: false, languages: false, commits: false, organizations: false, workflowRuns: false }))
  }
}, [])

React.useEffect(() => {
  fetchGitHubData()

  const intervalId = setInterval(fetchGitHubData, 300000) // Refresh every 5 minutes
  return () => clearInterval(intervalId)
}, [fetchGitHubData])

React.useEffect(() => {
  let filtered = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedLanguageFilter || repo.language === selectedLanguageFilter) &&
    new Date(repo.created_at) >= selectedDateRange[0] &&
    new Date(repo.created_at) <= selectedDateRange[1]
  )

  switch (sortOption) {
    case "stars":
      filtered.sort((a, b) => b.stargazers_count - a.stargazers_count)
      break
    case "updated":
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      break
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "issues":
      filtered.sort((a, b) => b.open_issues_count - a.open_issues_count)
      break
  }

  setFilteredRepos(filtered)
  setCurrentPage(1)
}, [searchQuery, repos, sortOption, selectedLanguageFilter, selectedDateRange])

const fetchReadme = async (fullName: string) => {
  try {
    setLoading(prev => ({ ...prev, readme: true }))
    const response = await octokit.repos.getReadme({ owner: "DuckyOnQuack-999", repo: fullName.split('/')[1] })
    const decodedContent = atob(response.data.content)
    setReadmeContent(decodedContent)
  } catch (error) {
    console.error("Error fetching README:", error)
    setReadmeContent("No README available")
    toast({
      title: "Error",
      description: "Failed to fetch README. The repository might not have a README file.",
      variant: "destructive",
    })
  } finally {
    setLoading(prev => ({ ...prev, readme: false }))
  }
}

const paginatedRepos = filteredRepos.slice(
  0,
  currentPage * reposPerPage
)

React.useEffect(() => {
  if (inView && isInfiniteScrollEnabled && currentPage < totalPages) {
    setCurrentPage(prev => prev + 1)
  }
}, [inView, isInfiniteScrollEnabled, currentPage, totalPages])

const ErrorFallback = ({ error, resetErrorBoundary }: { error: { message: string }, resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
    <Card className="bg-neutral-900/50 border-neutral-800 p-6 glow-card">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h2>
      <p className="text-neutral-400 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary} className="bg-red-500 hover:bg-red-600 text-white glow-button">
        Try again
      </Button>
    </Card>
  </div>
)

const LeftPanel = () => (
  <Sheet open={isLeftPanelOpen} onOpenChange={setIsLeftPanelOpen}>
    <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-neutral-900 border-r border-neutral-800">
      <SheetHeader>
        <SheetTitle className="text-red-500">{t('navigation')}</SheetTitle>
      </SheetHeader>
      <nav className="mt-6 space-y-4">
        <Link href="#repositories" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("repositories")}}>
          <Code className="w-5 h-5 mr-2" />
          {t('repositories')}
        </Link>
        <Link href="#projects" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("projects")}}>
          <Layers className="w-5 h-5 mr-2" />
          {t('projects')}
        </Link>
        <Link href="#docs" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("docs")}}>
          <FileText className="w-5 h-5 mr-2" />
          {t('docs')}
        </Link>
        <Link href="#apps" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("apps")}}>
          <Play className="w-5 h-5 mr-2" />
          {t('apps')}
        </Link>
        <Link href="#activity" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("activity")}}>
          <Calendar className="w-5 h-5 mr-2" />
          {t('activity')}
        </Link>
        <Link href="#gists" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("gists")}}>
          <FileText className="w-5 h-5 mr-2" />
          {t('gists')}
        </Link>
        <Link href="#pullrequests" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("pullrequests")}}>
          <GitPullRequest className="w-5 h-5 mr-2" />
          {t('pullRequests')}
        </Link>
        <Link href="#issues" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("issues")}}>
          <AlertCircle className="w-5 h-5 mr-2" />
          {t('issues')}
        </Link>
        <Link href="#achievements" className="flex items-center text-neutral-400 hover:text-white transition-colors" onClick={() => {setIsLeftPanelOpen(false); setActiveTab("achievements")}}>
          <Award className="w-5 h-5 mr-2" />
          {t('achievements')}
        </Link>
      </nav>
    </SheetContent>
  </Sheet>
)

const RightPanel = () => (
  <Sheet open={isRightPanelOpen} onOpenChange={setIsRightPanelOpen}>
    <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-neutral-900 border-l border-neutral-800">
      <SheetHeader>
        <SheetTitle className="text-red-500">{t('tools')}</SheetTitle>
        <SheetDescription>{t('toolsDescription')}</SheetDescription>
      </SheetHeader>
      <div className="mt-6 space-y-4">
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('analyzeRepository')}
        </Button>
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('generateDocumentation')}
        </Button>
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('codeQualityCheck')}
        </Button>
        <Button className="w-full justify-start glow-button" variant="outline">
          <Tool className="w-5 h-5 mr-2" />
          {t('dependencyAudit')}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
)

const LanguageChart = () => {
  const data = Object.entries(languageStats).map(([name, value]) => ({ name, value }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
          ))}
        </Pie>
        <RechartsTooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

const CommitActivityChart = () => {
  const commitData = commits.map(commit => ({
    date: new Date(commit.commit.author.date).toLocaleDateString(),
    commits: 1
  }))

  const aggregatedData = commitData.reduce((acc, { date, commits }) => {
    acc[date] = (acc[date] || 0) + commits
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(aggregatedData).map(([date, commits]) => ({ date, commits }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <RechartsTooltip />
        <Line type="monotone" dataKey="commits" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}

const SkillsVisualization = () => {
  const skillsArray = Object.entries(skills).sort((a, b) => b[1] - a[1])
  const maxValue = Math.max(...skillsArray.map(([_, value]) => value))

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {skillsArray.map(([skill, value]) => (
        <div key={skill} className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-red-400 mb-2">{skill}</h4>
          <div className="w-full bg-neutral-700 rounded-full h-2.5">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: `${(value / maxValue) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-neutral-400 mt-1">{value} repositories</p>
        </div>
      ))}
    </div>
  )
}

if (error) {
  return <ErrorFallback error={{ message: error }} resetErrorBoundary={fetchGitHubData} />
}

return (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className={`min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden ${isHighContrastMode ? 'high-contrast' : ''}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-purple-900/10 animate-gradient-shift"></div>
    <div className="relative z-10">
      <header className="bg-[#0D0D0D] border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Github className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-xl font-bold text-white">QuackHub</h1>
                <p className="text-sm text-neutral-400">{t('subtitle')}</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("repositories")}>
                <Code className="h-4 w-4 mr-2" />
                {t('repositories')}
              </Button>
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("projects")}>
                <Layers className="h-4 w-4 mr-2" />
                {t('projects')}
              </Button>
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("docs")}>
                <FileText className="h-4 w-4 mr-2" />
                {t('docs')}
              </Button>
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => setActiveTab("apps")}>
                <Play className="h-4 w-4 mr-2" />
                {t('apps')}
              </Button>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hidden md:flex">
                {t('quackLabsSolutions')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="bg-transparent border-neutral-800"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t('toggleTheme')}</span>
              </Button>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLeftPanelOpen(true)}
                className="md:hidden text-neutral-400 hover:text-white"
                aria-label={t('openNavig

ationMenu')}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <LeftPanel />
      <RightPanel />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-screen-xl mx-auto px-6 py-12"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        {loading.user || loading.repos ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
            <p className="text-neutral-400">{t('loadingGitHubData')}</p>
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center shadow-lg shadow-red-500/20">
                {userData?.avatar_url ? (
                  <img src={userData.avatar_url} alt={userData.name || "User avatar"} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Terminal className="w-16 h-16 text-red-500" />
                )}
              </div>
              <h1 className="text-4xl font-bold text-red-500 mb-2 glow-text">{userData?.name || "DuckyOnQuack-999"}</h1>
              <p className="text-neutral-400 mb-4">{userData?.bio || t('githubDeveloper')}</p>
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-neutral-400" />
                  <span>{userData?.public_repos || 0} {t('repos')}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-neutral-400" />
                  <span>{userData?.followers || 0} {t('followers')}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-neutral-400" />
                  <span>{userData?.following || 0} {t('following')}</span>
                </div>
              </div>
              <div className="flex justify-center mt-4 space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href={`https://twitter.com/${userData?.twitter_username}`} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                        <Twitter className="w-6 h-6" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('followTwitter')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href={userData?.blog} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                        <ExternalLink className="w-6 h-6" />
                        <span className="sr-only">{t('personalWebsite')}</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('visitWebsite')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href={`https://github.com/${userData?.login}`} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                        <Github className="w-6 h-6" />
                        <span className="sr-only">GitHub</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('viewGitHubProfile')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 flex flex-col md:flex-row gap-4"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('searchRepositories')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900/50 border-neutral-800 pl-10"
                  aria-label={t('searchRepositories')}
                />
              </div>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px] bg-neutral-900/50 border-neutral-800" aria-label={t('sortRepositories')}>
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stars">{t('stars')}</SelectItem>
                  <SelectItem value="updated">{t('lastUpdated')}</SelectItem>
                  <SelectItem value="name">{t('name')}</SelectItem>
                  <SelectItem value="issues">{t('openIssues')}</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {selectedLanguageFilter || t('allLanguages')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setSelectedLanguageFilter(null)}>
                    {t('allLanguages')}
                  </DropdownMenuItem>
                  {Object.keys(skills).map((language) => (
                    <DropdownMenuItem key={language} onSelect={() => setSelectedLanguageFilter(language)}>
                      {language}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="bg-black/90 rounded-lg p-1 border border-neutral-800">
                <TabsTrigger value="repositories" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('repositories')}
                </TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('projects')}
                </TabsTrigger>
                <TabsTrigger value="docs" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('docs')}
                </TabsTrigger>
                <TabsTrigger value="apps" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('apps')}
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('activity')}
                </TabsTrigger>
                <TabsTrigger value="gists" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('gists')}
                </TabsTrigger>
                <TabsTrigger value="pullrequests" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('prs')}
                </TabsTrigger>
                <TabsTrigger value="issues" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('issues')}
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-neutral-400 rounded-md px-4 py-2">
                  {t('skills')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="repositories">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {paginatedRepos.map((repo, index) => (
                    <motion.div 
                      key={repo.id} 
                      ref={index === paginatedRepos.length - 1 ? ref : null}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {inView && (
                        <Card
                          className="bg-neutral-900/50 border-neutral-800 hover:border-red-500/50 transition-colors shadow-lg shadow-red-500/10"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-red-500 text-lg font-semibold">{repo.name}</h3>
                                <p className="text-neutral-400 text-sm mt-1">{repo.description || t('noDescription')}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-neutral-400 hover:text-white"
                                onClick={() => {
                                  setSelectedRepo(repo)
                                  fetchReadme(repo.full_name)
                                }}
                                aria-label={t('viewDetails', { repo: repo.name })}
                              >
                                <Code className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-sm text-neutral-400">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                                {repo.language || t('unknown')}
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1" />
                                {repo.stargazers_count}
                              </div>
                              <div className="flex items-center">
                                <GitFork className="w-4 h-4 mr-1" />
                                {repo.forks_count}
                              </div>
                              <div className="flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {repo.open_issues_count}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
                {!isInfiniteScrollEnabled && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-neutral-800 hover:bg-neutral-700 glow-button"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      {t('previous')}
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="bg-neutral-800 hover:bg-neutral-700 glow-button"
                    >
                      {t('next')}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredRepos.slice(0, 4).map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-neutral-900/50 border-neutral-800 shadow-lg shadow-red-500/10">
                        <div className="p-6">
                          <h3 className="text-red-500 text-xl font-semibold mb-2">{project.name}</h3>
                          <p className="text-neutral-400 mb-4">{project.description}</p>
                          <div className="aspect-video bg-neutral-800 mb-4"></div>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              {project.topics && project.topics.slice(0, 3).map((topic, index) => (
                                <span key={index} className="bg-red-500/20 text-red-500 px-2 py-1 rounded-full text-xs">
                                  {topic}
                                </span>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Button className="bg-red-500 hover:bg-red-600 text-white glow-button" asChild>
                                <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                                  <Github className="w-4 h-4 mr-2" />
                                  {t('viewCode')}
                                </a>
                              </Button>
                              {project.homepage && (
                                <Button className="bg-neutral-800 hover:bg-neutral-700 text-white glow-button" asChild>
                                  <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {t('liveDemo')}
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="docs">
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('documentation')}</h2>
                  <p className="text-neutral-400 mb-4">{t('documentationDescription')}</p>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>{t('project1Documentation')}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-neutral-400">{t('project1DocumentationContent')}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>{t('project2Documentation')}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-neutral-400">{t('project2DocumentationContent')}</p>
                      </AccordionContent>
                    </AccordionItem>
                    {/* Add more accordion items for other projects */}
                  </Accordion>
                </Card>
              </TabsContent>

              <TabsContent value="apps">
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('applications')}</h2>
                  <p className="text-neutral-400 mb-4">{t('applicationsDescription')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add application cards here */}
                    <Card className="bg-neutral-800 p-4">
                      <h3 className="text-lg font-semibold text-red-400 mb-2">{t('app1')}</h3>
                      <p className="text-neutral-400 mb-2">{t('app1Description')}</p>
                      <Button className="bg-red-500 hover:bg-red-600 text-white">{t('launchApp')}</Button>
                    </Card>
                    <Card className="bg-neutral-800 p-4">
                      <h3 className="text-lg font-semibold text-red-400 mb-2">{t('app2')}</h3>
                      <p className="text-neutral-400 mb-2">{t('app2Description')}</p>
                      <Button className="bg-red-500 hover:bg-red-600 text-white">{t('launchApp')}</Button>
                    </Card>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('recentActivity')}</h2>
                  <ul className="space-y-4">
                    {activities.map((activity, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-neutral-400" />
                        <span className="text-neutral-400">{new Date(activity.created_at).toLocaleDateString()}</span>
                        <span className="text-white">{t('activityDescription', { type: activity.type, repo: activity.repo.name })}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="bg-neutral-900/50 border-neutral-800 p-6 mt-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('contributionGraph')}</h2>
                  {contributionData && (
                    <GitHubCalendar
                      username="DuckyOnQuack-999"
                      data={contributionData}
                      theme={{
                        level0: '#161b22',
                        level1: '#0e4429',
                        level2: '#006d32',
                        level3: '#26a641',
                        level4: '#39d353',
                      }}
                    />
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="gists">
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('gists')}</h2>
                  <div className="space-y-4">
                    {gists.map((gist) => (
                      <Card key={gist.id} className="bg-neutral-800 p-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-2">{gist.description || t('untitledGist')}</h3>
                        <p className="text-neutral-400 mb-2">
                          {t('files')}: {Object.keys(gist.files).join(", ")}
                        </p>
                        <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
                          <a href={gist.html_url} target="_blank" rel="noopener noreferrer">{t('viewGist')}</a>
                        </Button>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="pullrequests">
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('pullRequests')}</h2>
                  <div className="space-y-4">
                    {pullRequests.map((pr) => (
                      <Card key={pr.id} className="bg-neutral-800 p-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-2">{pr.title}</h3>
                        <p className="text-neutral-400 mb-2">
                          {t('status')}: {pr.state} | {t('created')}: {new Date(pr.created_at).toLocaleDateString()}
                        </p>
                        <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
                          <a href={pr.html_url} target="_blank" rel="noopener noreferrer">{t('viewPR')}</a>
                        </Button>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="issues">
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('issues')}</h2>
                  <div className="space-y-4">
                    {issues.map((issue) => (
                      <Card key={issue.id} className="bg-neutral-800 p-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-2">{issue.title}</h3>
                        <p className="text-neutral-400 mb-2">
                          {t('status')}: {issue.state} | {t('created')}: {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                        <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
                          <a href={issue.html_url} target="_blank" rel="noopener noreferrer">{t('viewIssue')}</a>
                        </Button>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card className="bg-neutral-900/50 border-neutral-800 p-6">
                  <h2 className="text-2xl font-bold text-red-500 mb-4">{t('skills')}</h2>
                  <SkillsVisualization />
                </Card>
              </TabsContent>
            </Tabs>

            {selectedRepo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                onClick={() => setSelectedRepo(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300 }}
                  className="w-full max-w-3xl max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Card className="bg-neutral-900 border-neutral-800">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-red-500">{selectedRepo.name}</h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-neutral-400 hover:text-white"
                          onClick={() => setSelectedRepo(null)}
                          aria-label={t('close')}
                        >
                          <X className="w-6 h-6" />
                        </Button>
                      </div>
                      {loading.readme ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                        </div>
                      ) : (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    {...props}
                                    children={String(children).replace(/
$/, '')}
                                    style={atomDark}
                                    language={match[1]}
                                    PreTag="div"
                                  />
                                ) : (
                                  <code {...props} className={className}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {readmeContent}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </motion.main>

      <footer className="bg-[#0D0D0D] border-t border-neutral-800 py-8">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-red-500">QuackHub</h3>
              <p className="text-neutral-400">{t('subtitle')}</p>
            </div>
            <nav className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">{t('privacyPolicy')}</a>
              <a href="#" className="text-neutral-400 hover:text-white">{t('termsOfService')}</a>
              <a href="#" className="text-neutral-400 hover:text-white">{t('contact')}</a>
            </nav>
          </div>
          <div className="mt-8 text-center text-neutral-400">
            <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  </motion.div>
)
}