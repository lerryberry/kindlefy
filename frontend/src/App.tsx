import LoginButton from './components/login'
import LogoutButton from './components/logout'
import Profile from './components/profile'
import Decisions from './components/decision/decisionsList'
import Decision from './components/decision/decisionHead'
import Tab from './components/util/tabs'

function App() {
  return (
    <>
      <p>Hello Worlds</p>
      <LoginButton />
      <LogoutButton />
      <Profile />
      <Decision />
      <Decisions />
      <Tab />
    </>
  )
}

export default App