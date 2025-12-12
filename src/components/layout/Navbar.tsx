import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Menu, BookOpen, ChevronRight, Anchor, Ship, Compass } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { UserMenu } from '@/components/UserMenu'

// Merchant Navy Course Categories with Specializations
const courseCategories = [
  {
    id: 'deck',
    name: 'Deck Department',
    icon: Ship,
    specializations: [
      { id: 'deck-1', name: 'Navigation & Watchkeeping', courses: ['ARPA', 'ECDIS', 'Bridge Resource Management'] },
      { id: 'deck-2', name: 'Cargo Operations', courses: ['Cargo Handling', 'Container Operations', 'Tanker Operations'] },
      { id: 'deck-3', name: 'Safety & Security', courses: ['ISPS Code', 'Ship Security Officer', 'Crisis Management'] }
    ]
  },
  {
    id: 'engine',
    name: 'Engine Department',
    icon: Compass,
    specializations: [
      { id: 'engine-1', name: 'Marine Engineering', courses: ['Main Engine Operations', 'Auxiliary Machinery', 'Refrigeration Systems'] },
      { id: 'engine-2', name: 'Electrical Systems', courses: ['Marine Electrical', 'Automation & Control', 'Power Management'] },
      { id: 'engine-3', name: 'Maintenance & Repair', courses: ['Preventive Maintenance', 'Troubleshooting', 'Workshop Practices'] }
    ]
  },
  {
    id: 'certifications',
    name: 'Certifications & Endorsements',
    icon: Anchor,
    specializations: [
      { id: 'cert-1', name: 'STCW Certifications', courses: ['Basic Safety Training', 'Advanced Fire Fighting', 'Medical First Aid'] },
      { id: 'cert-2', name: 'Management Level', courses: ['CoC Class 1', 'CoC Class 2', 'CoC Class 3'] },
      { id: 'cert-3', name: 'Specialized Training', courses: ['DPO Training', 'GMDSS', 'High Voltage'] }
    ]
  },
  {
    id: 'maritime-law',
    name: 'Maritime Law & Regulations',
    icon: BookOpen,
    specializations: [
      { id: 'law-1', name: 'International Conventions', courses: ['SOLAS', 'MARPOL', 'MLC 2006'] },
      { id: 'law-2', name: 'Port State Control', courses: ['PSC Inspections', 'Deficiencies Management', 'Compliance'] },
      { id: 'law-3', name: 'Maritime Insurance', courses: ['P&I Insurance', 'H&M Insurance', 'Cargo Insurance'] }
    ]
  }
]

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCoursesMenu, setShowCoursesMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSpecialization, setActiveSpecialization] = useState<string | null>(null)
  const coursesMenuRef = useRef<HTMLDivElement>(null)
  const coursesButtonRef = useRef<HTMLButtonElement>(null)

  // Handle click outside to close courses menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        coursesMenuRef.current &&
        !coursesMenuRef.current.contains(event.target as Node) &&
        coursesButtonRef.current &&
        !coursesButtonRef.current.contains(event.target as Node)
      ) {
        setShowCoursesMenu(false)
        setActiveCategory(null)
        setActiveSpecialization(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('/courses')
    }
  }

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard'
    switch (user.role) {
      case 'admin':
        return 'Platform Admin'
      case 'institute':
        return 'Manage Institute'
      case 'student':
        return 'My Learning'
      default:
        return 'Dashboard'
    }
  }

  const getDashboardRoute = () => {
    if (!user) return '/student'
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'institute':
        return '/institutes'
      case 'student':
        return '/student'
      default:
        return '/student'
    }
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const isHome = location.pathname === '/'
    const isCourses = location.pathname === '/courses' || location.pathname.startsWith('/course/')
    const isDashboard = location.pathname.includes('/admin') || location.pathname.includes('/student') || location.pathname.includes('/institutes')

    return (
      <>
        {!user || user.role === 'student' ? (
          <>
            <button
              onClick={() => navigate('/')}
              className={`${mobile ? 'text-left w-full px-4 py-2 text-foreground hover:bg-primary/20' : 'text-white drop-shadow-md'} text-sm font-medium transition-all duration-200 ${
                isHome ? (mobile ? 'bg-primary/10 text-primary' : 'text-white/90 border-b-2 border-white') : 'hover:text-white/80'
              }`}
            >
              Home
            </button>
            {mobile ? (
              <button
                onClick={() => navigate('/courses')}
                className={`text-left w-full px-4 py-2 text-foreground hover:bg-primary/20 text-sm font-medium transition-all duration-200 ${
                  isCourses ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                Browse Courses
              </button>
            ) : (
              <div className="relative">
                <button
                  ref={coursesButtonRef}
                  onMouseEnter={() => setShowCoursesMenu(true)}
                  onClick={() => navigate('/courses')}
                  className={`text-white drop-shadow-md text-sm font-medium transition-all duration-200 ${
                    isCourses ? 'text-white/90 border-b-2 border-white' : 'hover:text-white/80'
                  }`}
                >
                  Browse Courses
                </button>
              </div>
            )}
          </>
        ) : null}
        {user && (
          <button
            onClick={() => navigate(getDashboardRoute())}
            className={`${mobile ? 'text-left w-full px-4 py-2 text-foreground hover:bg-primary/20' : 'text-white drop-shadow-md'} text-sm font-medium transition-all duration-200 ${
              isDashboard ? (mobile ? 'bg-primary/10 text-primary' : 'text-white/90 border-b-2 border-white') : 'hover:text-white/80'
            }`}
          >
            {getDashboardLabel()}
          </button>
        )}
      </>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-primary via-accent to-primary/80 shadow-lg">
      {/* Maritime Background Pattern */}
      <div className="absolute inset-0 opacity-10 hidden md:block" style={{
        backgroundImage: `url('/images/Header-Background.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 group-hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30">
              <BookOpen className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md group-hover:text-white/90 transition-colors">SeaLearn</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>

          {/* Courses Mega Menu - Desktop Only */}
          {showCoursesMenu && (
            <div
              ref={coursesMenuRef}
              onMouseEnter={() => setShowCoursesMenu(true)}
              onMouseLeave={() => {
                setShowCoursesMenu(false)
                setActiveCategory(null)
                setActiveSpecialization(null)
              }}
              className="absolute left-0 top-16 w-full bg-white shadow-2xl border-t-4 border-primary z-50 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-12 gap-6">
                  {/* Categories Column */}
                  <div className="col-span-3 border-r border-border pr-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Browse by Department
                    </h3>
                    <div className="space-y-1">
                      {courseCategories.map((category) => {
                        const Icon = category.icon
                        return (
                          <button
                            key={category.id}
                            onMouseEnter={() => {
                              setActiveCategory(category.id)
                              setActiveSpecialization(null)
                            }}
                            onClick={() => navigate('/courses')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                              activeCategory === category.id
                                ? 'bg-primary text-white shadow-md'
                                : 'hover:bg-muted text-foreground'
                            }`}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{category.name}</span>
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Specializations Column */}
                  <div className="col-span-4 border-r border-border pr-4">
                    {activeCategory ? (
                      <>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                          Specializations
                        </h3>
                        <div className="space-y-1">
                          {courseCategories
                            .find((cat) => cat.id === activeCategory)
                            ?.specializations.map((spec) => (
                              <button
                                key={spec.id}
                                onMouseEnter={() => setActiveSpecialization(spec.id)}
                                onClick={() => navigate('/courses')}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                                  activeSpecialization === spec.id
                                    ? 'bg-accent text-accent-foreground shadow-sm'
                                    : 'hover:bg-muted text-foreground'
                                }`}
                              >
                                <span className="text-sm font-medium">{spec.name}</span>
                                <ChevronRight className="h-4 w-4 ml-auto" />
                              </button>
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">Hover over a department to see specializations</p>
                      </div>
                    )}
                  </div>

                  {/* Courses Column */}
                  <div className="col-span-5">
                    {activeSpecialization ? (
                      <>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                          Available Courses
                        </h3>
                        <div className="space-y-2">
                          {courseCategories
                            .find((cat) => cat.id === activeCategory)
                            ?.specializations.find((spec) => spec.id === activeSpecialization)
                            ?.courses.map((course, idx) => (
                              <button
                                key={idx}
                                onClick={() => navigate('/courses')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-200 group"
                              >
                                <div className="h-2 w-2 rounded-full bg-primary/60 group-hover:bg-primary" />
                                <span className="text-sm text-foreground group-hover:text-primary font-medium">
                                  {course}
                                </span>
                              </button>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <Button
                            onClick={() => navigate('/courses')}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View All Courses
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">Select a specialization to view courses</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm border-white/30 focus:border-white"
              />
            </div>
          </form>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/sign-in')} className="hidden sm:inline-flex text-white hover:text-white hover:bg-white/20">
                  Sign In
                </Button>
                <Button onClick={() => navigate('/sign-up')} className="bg-white text-primary hover:text-primary hover:bg-white/90">
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  <form onSubmit={handleSearch} className="lg:hidden">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>
                  <div className="flex flex-col gap-2">
                    <NavLinks mobile />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
