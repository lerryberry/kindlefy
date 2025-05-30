import { useState } from "react";
import NewDecisionForm from "../decision/newDecisionForm";

const Tab = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (tabIndex: number) => {
        setActiveTab(tabIndex);
    };

    return (
        <div className="tabs">
            <span onClick={() => handleTabClick(0)} style={{ color: activeTab === 0 ? "black" : "grey" }}>tab 1</span>
            <span onClick={() => handleTabClick(1)} style={{ color: activeTab === 1 ? "black" : "grey" }}>tab 2</span>

            {activeTab === 0 && <NewDecisionForm />}
        </div>
    );
};

export default Tab;