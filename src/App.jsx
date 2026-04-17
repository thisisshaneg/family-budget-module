import { useEffect, useRef, useState } from 'react'
import './App.css'

const storageKey = 'family-budget-sections'
const frequencyOptions = ['Weekly', 'Fortnightly', 'Monthly', 'Annually']
const allocationOptions = ['Shane', 'Erika', 'Shared', 'Unassigned']
const annualMultipliers = {
  Weekly: 52,
  Fortnightly: 26,
  Monthly: 12,
  Annually: 1,
}

const emptyTotals = { weekly: 0, fortnightly: 0, monthly: 0, annual: 0 }

function createEmptyTotals() {
  return { weekly: 0, fortnightly: 0, monthly: 0, annual: 0 }
}

function createEmptySharedContributionEntry() {
  return {
    shane: { amount: '', frequency: 'Weekly' },
    erika: { amount: '', frequency: 'Weekly' },
  }
}

function getExpenseItemKey(sectionId, rowId) {
  return `${sectionId}:${rowId}`
}

const initialBudgetSections = [
  {
    id: 'shane-income',
    category: 'Income',
    title: 'Shane income',
    rows: [
      { id: 1, description: 'Salary', amount: '2400.00', frequency: 'Fortnightly' },
      { id: 2, description: 'Freelance work', amount: '350.00', frequency: 'Monthly' },
    ],
  },
  {
    id: 'erika-income',
    category: 'Income',
    title: 'Erika income',
    rows: [
      { id: 1, description: 'Salary', amount: '1800.00', frequency: 'Fortnightly' },
      { id: 2, description: 'Tutoring', amount: '120.00', frequency: 'Weekly' },
    ],
  },
  {
    id: 'house-expenses',
    category: 'Expenses',
    title: 'House expenses',
    rows: [
      {
        id: 1,
        description: 'Mortgage',
        amount: '780.00',
        frequency: 'Weekly',
        allocation: 'Shared',
      },
      {
        id: 2,
        description: 'Home insurance',
        amount: '2100.00',
        frequency: 'Annually',
        allocation: 'Shared',
      },
    ],
  },
  {
    id: 'living-expenses',
    category: 'Expenses',
    title: 'Living expenses',
    rows: [
      {
        id: 1,
        description: 'Groceries',
        amount: '260.00',
        frequency: 'Weekly',
        allocation: 'Shared',
      },
      {
        id: 2,
        description: 'Internet',
        amount: '95.00',
        frequency: 'Monthly',
        allocation: 'Shared',
      },
    ],
  },
  {
    id: 'car-expenses',
    category: 'Expenses',
    title: 'Car expenses',
    rows: [
      {
        id: 1,
        description: 'Fuel',
        amount: '140.00',
        frequency: 'Weekly',
        allocation: 'Shared',
      },
      {
        id: 2,
        description: 'Car registration',
        amount: '420.00',
        frequency: 'Annually',
        allocation: 'Shared',
      },
    ],
  },
  {
    id: 'erika-personal-expenses',
    category: 'Expenses',
    title: 'Erika personal expenses',
    rows: [
      {
        id: 1,
        description: 'Gym membership',
        amount: '25.00',
        frequency: 'Weekly',
        allocation: 'Erika',
      },
      {
        id: 2,
        description: 'Hair appointments',
        amount: '90.00',
        frequency: 'Monthly',
        allocation: 'Erika',
      },
    ],
  },
  {
    id: 'shane-personal-expenses',
    category: 'Expenses',
    title: 'Shane personal expenses',
    rows: [
      {
        id: 1,
        description: 'Sports fees',
        amount: '35.00',
        frequency: 'Weekly',
        allocation: 'Shane',
      },
      {
        id: 2,
        description: 'Streaming subscriptions',
        amount: '28.00',
        frequency: 'Monthly',
        allocation: 'Shane',
      },
    ],
  },
  {
    id: 'kids-expenses',
    category: 'Expenses',
    title: 'Kids expenses',
    rows: [
      {
        id: 1,
        description: 'School lunches',
        amount: '75.00',
        frequency: 'Weekly',
        allocation: 'Shared',
      },
      {
        id: 2,
        description: 'School supplies',
        amount: '600.00',
        frequency: 'Annually',
        allocation: 'Shared',
      },
    ],
  },
  {
    id: 'savings',
    category: 'Expenses',
    title: 'Savings',
    rows: [
      {
        id: 1,
        description: 'Emergency fund',
        amount: '200.00',
        frequency: 'Fortnightly',
        allocation: 'Shared',
      },
      {
        id: 2,
        description: 'Holiday savings',
        amount: '150.00',
        frequency: 'Monthly',
        allocation: 'Shared',
      },
    ],
  },
  {
    id: 'investing',
    category: 'Expenses',
    title: 'Investing',
    rows: [
      {
        id: 1,
        description: 'Index fund',
        amount: '180.00',
        frequency: 'Fortnightly',
        allocation: 'Shared',
      },
      {
        id: 2,
        description: 'Kids investment account',
        amount: '60.00',
        frequency: 'Monthly',
        allocation: 'Shared',
      },
    ],
  },
]

const initialTransferSections = [
  {
    id: 'shane-transfers',
    title: 'Shane transfers',
    person: 'Shane',
    rows: [
      {
        id: 1,
        description: 'House account transfer',
        amount: '1200.00',
        frequency: 'Monthly',
      },
      {
        id: 2,
        description: 'Savings transfer',
        amount: '250.00',
        frequency: 'Monthly',
      },
    ],
  },
  {
    id: 'erika-transfers',
    title: 'Erika transfers',
    person: 'Erika',
    rows: [
      {
        id: 1,
        description: 'House account transfer',
        amount: '900.00',
        frequency: 'Monthly',
      },
      {
        id: 2,
        description: 'Kids account transfer',
        amount: '180.00',
        frequency: 'Monthly',
      },
    ],
  },
]

function isValidBudgetSections(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (section) =>
        section &&
        typeof section.id === 'string' &&
        typeof section.category === 'string' &&
        typeof section.title === 'string' &&
        Array.isArray(section.rows) &&
        section.rows.every(
          (row) =>
            row &&
            typeof row.id === 'number' &&
            typeof row.description === 'string' &&
            typeof row.amount === 'string' &&
            frequencyOptions.includes(row.frequency),
        ),
    )
  )
}

function normalizeBudgetSections(sections) {
  return sections.map((section) => ({
    ...section,
    rows: section.rows.map((row) =>
      section.category === 'Expenses'
        ? {
            ...row,
            allocation: allocationOptions.includes(row.allocation)
              ? row.allocation
              : 'Unassigned',
          }
        : row,
    ),
  }))
}

function isValidTransferSections(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (section) =>
        section &&
        typeof section.id === 'string' &&
        typeof section.title === 'string' &&
        typeof section.person === 'string' &&
        Array.isArray(section.rows) &&
        section.rows.every(
          (row) =>
            row &&
            typeof row.id === 'number' &&
            typeof row.description === 'string' &&
            typeof row.amount === 'string' &&
            frequencyOptions.includes(row.frequency),
        ),
    )
  )
}

function isValidContributionPerson(value) {
  return (
    value &&
    typeof value.amount === 'string' &&
    frequencyOptions.includes(value.frequency)
  )
}

function isValidSharedContributionPlans(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (entry) =>
        entry &&
        typeof entry === 'object' &&
        isValidContributionPerson(entry.shane) &&
        isValidContributionPerson(entry.erika),
    )
  )
}

function normalizeSharedContributionPlans(value) {
  if (!isValidSharedContributionPlans(value)) {
    return {}
  }

  return value
}

function getInitialAppState() {
  const fallbackState = {
    budgetSections: normalizeBudgetSections(initialBudgetSections),
    transferSections: initialTransferSections,
    sharedContributionPlans: {},
  }

  if (typeof window === 'undefined') {
    return fallbackState
  }

  const savedData = window.localStorage.getItem(storageKey)

  if (!savedData) {
    return fallbackState
  }

  try {
    const parsedData = JSON.parse(savedData)

    if (isValidBudgetSections(parsedData)) {
      return {
        budgetSections: normalizeBudgetSections(parsedData),
        transferSections: initialTransferSections,
        sharedContributionPlans: {},
      }
    }

    if (
      parsedData &&
      isValidBudgetSections(parsedData.budgetSections) &&
      isValidTransferSections(parsedData.transferSections)
    ) {
      return {
        ...parsedData,
        budgetSections: normalizeBudgetSections(parsedData.budgetSections),
        sharedContributionPlans: normalizeSharedContributionPlans(
          parsedData.sharedContributionPlans,
        ),
      }
    }
  } catch {
    return fallbackState
  }

  return fallbackState
}

function calculateAnnualAmount(amount, frequency) {
  const parsedAmount = Number.parseFloat(amount)
  const multiplier = annualMultipliers[frequency]

  if (!Number.isFinite(parsedAmount) || !Number.isFinite(multiplier)) {
    return 0
  }

  return parsedAmount * multiplier
}

function calculateRowAmounts(row) {
  const annual = calculateAnnualAmount(row.amount, row.frequency)

  return {
    annual,
    monthly: annual / 12,
    fortnightly: annual / 26,
    weekly: annual / 52,
  }
}

function calculateSectionTotals(rows) {
  return rows.reduce(
    (totals, row) => {
      const amounts = calculateRowAmounts(row)

      return {
        annual: totals.annual + amounts.annual,
        monthly: totals.monthly + amounts.monthly,
        fortnightly: totals.fortnightly + amounts.fortnightly,
        weekly: totals.weekly + amounts.weekly,
      }
    },
    emptyTotals,
  )
}

function calculateDifferenceTotals(incomeTotals, transferTotals) {
  return {
    annual: incomeTotals.annual - transferTotals.annual,
    monthly: incomeTotals.monthly - transferTotals.monthly,
    fortnightly: incomeTotals.fortnightly - transferTotals.fortnightly,
    weekly: incomeTotals.weekly - transferTotals.weekly,
  }
}

function buildAllocatedExpenseGroups(sections) {
  return sections
    .filter((section) => section.category === 'Expenses')
    .reduce(
      (groups, section) => {
        section.rows.forEach((row) => {
          const allocation = allocationOptions.includes(row.allocation)
            ? row.allocation
            : 'Unassigned'

          groups[allocation].push({
            key: getExpenseItemKey(section.id, row.id),
            description: row.description,
            amounts: calculateRowAmounts(row),
          })
        })

        return groups
      },
      {
        Shane: [],
        Erika: [],
        Shared: [],
        Unassigned: [],
      },
    )
}

function formatAmount(value) {
  return (Number.isFinite(value) ? value : 0).toFixed(2)
}

function createEmptyBudgetRow(rows, category) {
  const nextId = rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1

  return {
    id: nextId,
    description: '',
    amount: '',
    frequency: 'Weekly',
    ...(category === 'Expenses' ? { allocation: 'Unassigned' } : {}),
  }
}

function createEmptyTransferRow(rows) {
  const nextId = rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1

  return {
    id: nextId,
    description: '',
    amount: '',
    frequency: 'Weekly',
  }
}

function renderSummaryValues(totals) {
  return (
    <div className="summary-values">
      <strong>Weekly {formatAmount(totals.weekly)}</strong>
      <strong>Fortnightly {formatAmount(totals.fortnightly)}</strong>
      <strong>Monthly {formatAmount(totals.monthly)}</strong>
      <strong>Annual {formatAmount(totals.annual)}</strong>
    </div>
  )
}

export default function App() {
  const [initialAppState] = useState(getInitialAppState)
  const [budgetSections, setBudgetSections] = useState(initialAppState.budgetSections)
  const [transferSections, setTransferSections] = useState(
    initialAppState.transferSections,
  )
  const [sharedContributionPlans, setSharedContributionPlans] = useState(
    initialAppState.sharedContributionPlans,
  )
  const [activeTab, setActiveTab] = useState('budget')
  const hasLoadedInitialState = useRef(false)

  useEffect(() => {
    if (!hasLoadedInitialState.current) {
      hasLoadedInitialState.current = true
      return
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        budgetSections,
        transferSections,
        sharedContributionPlans,
      }),
    )
  }, [budgetSections, transferSections, sharedContributionPlans])

  function handleItemChange(sectionId, rowId, field, value) {
    setBudgetSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row,
              ),
            }
          : section,
      ),
    )
  }

  function handleAddRow(sectionId) {
    setBudgetSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: [...section.rows, createEmptyBudgetRow(section.rows, section.category)],
            }
          : section,
      ),
    )
  }

  function handleDeleteRow(sectionId, rowId) {
    setBudgetSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.filter((row) => row.id !== rowId),
            }
          : section,
      ),
    )
  }

  function handleTransferChange(sectionId, rowId, field, value) {
    setTransferSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.map((row) =>
                row.id === rowId ? { ...row, [field]: value } : row,
              ),
            }
          : section,
      ),
    )
  }

  function handleAddTransferRow(sectionId) {
    setTransferSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: [...section.rows, createEmptyTransferRow(section.rows)],
            }
          : section,
      ),
    )
  }

  function handleDeleteTransferRow(sectionId, rowId) {
    setTransferSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rows: section.rows.filter((row) => row.id !== rowId),
            }
          : section,
      ),
    )
  }

  function getSharedContributionPlan(itemKey) {
    return sharedContributionPlans[itemKey] ?? createEmptySharedContributionEntry()
  }

  function handleSharedContributionChange(itemKey, person, field, value) {
    setSharedContributionPlans((currentPlans) => ({
      ...currentPlans,
      [itemKey]: {
        ...(currentPlans[itemKey] ?? createEmptySharedContributionEntry()),
        [person]: {
          ...(currentPlans[itemKey]?.[person] ?? {
            amount: '',
            frequency: 'Weekly',
          }),
          [field]: value,
        },
      },
    }))
  }

  const groupedSections = budgetSections.reduce((groups, section) => {
    const existingGroup = groups.find((group) => group.title === section.category)

    if (existingGroup) {
      existingGroup.sections.push(section)
      return groups
    }

    return [...groups, { title: section.category, sections: [section] }]
  }, [])
  const allocatedExpenseGroups = buildAllocatedExpenseGroups(budgetSections)

  const shaneIncomeTotals = calculateSectionTotals(
    budgetSections.find((section) => section.id === 'shane-income')?.rows ?? [],
  )
  const erikaIncomeTotals = calculateSectionTotals(
    budgetSections.find((section) => section.id === 'erika-income')?.rows ?? [],
  )
  const shaneTransferTotals = calculateSectionTotals(
    transferSections.find((section) => section.id === 'shane-transfers')?.rows ?? [],
  )
  const erikaTransferTotals = calculateSectionTotals(
    transferSections.find((section) => section.id === 'erika-transfers')?.rows ?? [],
  )
  const shaneRemainingTotals = calculateDifferenceTotals(
    shaneIncomeTotals,
    shaneTransferTotals,
  )
  const erikaRemainingTotals = calculateDifferenceTotals(
    erikaIncomeTotals,
    erikaTransferTotals,
  )

  return (
    <main className="budget-page">
      <div className="page-header">
        <h1>Family Budget</h1>
        <p>Track income, expenses, and transfers in simple editable sections.</p>
      </div>

      <div className="tab-bar" role="tablist" aria-label="Budget views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'budget'}
          className={activeTab === 'budget' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('budget')}
        >
          Budget
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'transfers'}
          className={activeTab === 'transfers' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('transfers')}
        >
          Transfer Planner
        </button>
      </div>

      {activeTab === 'budget' ? (
        <section className="budget-card">
          <div className="budget-header">
            <h2>Budget</h2>
            <p>Review and edit the main household budget sections.</p>
          </div>

          <div className="budget-groups">
            {groupedSections.map((group) => (
              <section key={group.title} className="budget-group">
                <div className="group-header">
                  <h2>{group.title}</h2>
                </div>

                <div className="section-list">
                {group.sections.map((section) => {
                  const totals = calculateSectionTotals(section.rows)
                  const isExpenseSection = section.category === 'Expenses'

                  return (
                    <article key={section.id} className="budget-section">
                        <div className="section-header">
                          <h3>{section.title}</h3>
                          <button
                            type="button"
                            className="section-action"
                            onClick={() => handleAddRow(section.id)}
                          >
                            Add row
                          </button>
                        </div>

                        <div className="table-wrap">
                          <table className="budget-table">
                            <thead>
                            <tr>
                              <th>Description</th>
                              <th>Amount</th>
                              <th>Frequency</th>
                              {isExpenseSection ? <th>Allocation</th> : null}
                              <th>Weekly</th>
                              <th>Fortnightly</th>
                              <th>Monthly</th>
                                <th>Annual</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.rows.map((row) => {
                                const amounts = calculateRowAmounts(row)

                                return (
                                  <tr key={row.id}>
                                    <td className="description-cell">
                                      <textarea
                                        rows="3"
                                        className="description-input"
                                        value={row.description}
                                        onChange={(event) =>
                                          handleItemChange(
                                            section.id,
                                            row.id,
                                            'description',
                                            event.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        value={row.amount}
                                        onChange={(event) =>
                                          handleItemChange(
                                            section.id,
                                            row.id,
                                            'amount',
                                            event.target.value,
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <select
                                        value={row.frequency}
                                        onChange={(event) =>
                                          handleItemChange(
                                            section.id,
                                            row.id,
                                            'frequency',
                                            event.target.value,
                                          )
                                        }
                                    >
                                      {frequencyOptions.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  {isExpenseSection ? (
                                    <td className="allocation-cell">
                                      <select
                                        value={row.allocation ?? 'Unassigned'}
                                        onChange={(event) =>
                                          handleItemChange(
                                            section.id,
                                            row.id,
                                            'allocation',
                                            event.target.value,
                                          )
                                        }
                                      >
                                        {allocationOptions.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  ) : null}
                                  <td className="calculated-cell">
                                    {formatAmount(amounts.weekly)}
                                  </td>
                                    <td className="calculated-cell">
                                      {formatAmount(amounts.fortnightly)}
                                    </td>
                                    <td className="calculated-cell">
                                      {formatAmount(amounts.monthly)}
                                    </td>
                                    <td className="calculated-cell">
                                      {formatAmount(amounts.annual)}
                                    </td>
                                    <td className="actions-cell">
                                      <button
                                        type="button"
                                        className="row-delete-button"
                                        onClick={() =>
                                          handleDeleteRow(section.id, row.id)
                                        }
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                              )
                            })}
                            <tr className="subtotal-row">
                                <td colSpan={isExpenseSection ? 4 : 3}>Section subtotal</td>
                                <td className="calculated-cell">
                                  {formatAmount(totals.weekly)}
                                </td>
                                <td className="calculated-cell">
                                  {formatAmount(totals.fortnightly)}
                                </td>
                                <td className="calculated-cell">
                                  {formatAmount(totals.monthly)}
                                </td>
                                <td className="calculated-cell">
                                  {formatAmount(totals.annual)}
                                </td>
                                <td className="actions-cell" />
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : (
        <section className="transfer-card">
          <div className="budget-header">
            <h2>Transfer Planner</h2>
            <p>Plan each person&apos;s transfers using the same time-based view as the main budget.</p>
          </div>

          <section className="allocation-planning-card">
            <div className="summary-block-header">
              <h3>Allocated Expense Planning</h3>
              <p>Generated from all expense rows in the budget, grouped by allocation.</p>
            </div>

            <div className="generated-planning-list">
              <article className="budget-section">
                <div className="summary-block-header">
                  <h3>Shane allocated expenses</h3>
                </div>

                <div className="table-wrap">
                  <table className="budget-table allocation-summary-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Weekly</th>
                        <th>Fortnightly</th>
                        <th>Monthly</th>
                        <th>Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocatedExpenseGroups.Shane.length > 0 ? (
                        allocatedExpenseGroups.Shane.map((item) => (
                          <tr key={item.key}>
                            <td>{item.description}</td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.weekly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.fortnightly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.monthly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.annual)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No Shane-allocated expenses yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="budget-section">
                <div className="summary-block-header">
                  <h3>Erika allocated expenses</h3>
                </div>

                <div className="table-wrap">
                  <table className="budget-table allocation-summary-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Weekly</th>
                        <th>Fortnightly</th>
                        <th>Monthly</th>
                        <th>Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocatedExpenseGroups.Erika.length > 0 ? (
                        allocatedExpenseGroups.Erika.map((item) => (
                          <tr key={item.key}>
                            <td>{item.description}</td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.weekly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.fortnightly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.monthly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.annual)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No Erika-allocated expenses yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="budget-section">
                <div className="summary-block-header">
                  <h3>Shared allocated expenses</h3>
                </div>

                <div className="table-wrap">
                  <table className="budget-table shared-allocation-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Weekly</th>
                        <th>Fortnightly</th>
                        <th>Monthly</th>
                        <th>Annual</th>
                        <th>Shane Amount</th>
                        <th>Shane Frequency</th>
                        <th>Shane Weekly</th>
                        <th>Shane Fortnightly</th>
                        <th>Shane Monthly</th>
                        <th>Shane Annual</th>
                        <th>Erika Amount</th>
                        <th>Erika Frequency</th>
                        <th>Erika Weekly</th>
                        <th>Erika Fortnightly</th>
                        <th>Erika Monthly</th>
                        <th>Erika Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocatedExpenseGroups.Shared.length > 0 ? (
                        allocatedExpenseGroups.Shared.map((item) => {
                          const plan = getSharedContributionPlan(item.key)
                          const shaneAmounts = calculateRowAmounts(plan.shane)
                          const erikaAmounts = calculateRowAmounts(plan.erika)

                          return (
                            <tr key={item.key}>
                              <td>{item.description}</td>
                              <td className="calculated-cell">
                                {formatAmount(item.amounts.weekly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(item.amounts.fortnightly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(item.amounts.monthly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(item.amounts.annual)}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={plan.shane.amount}
                                  onChange={(event) =>
                                    handleSharedContributionChange(
                                      item.key,
                                      'shane',
                                      'amount',
                                      event.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  value={plan.shane.frequency}
                                  onChange={(event) =>
                                    handleSharedContributionChange(
                                      item.key,
                                      'shane',
                                      'frequency',
                                      event.target.value,
                                    )
                                  }
                                >
                                  {frequencyOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(shaneAmounts.weekly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(shaneAmounts.fortnightly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(shaneAmounts.monthly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(shaneAmounts.annual)}
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={plan.erika.amount}
                                  onChange={(event) =>
                                    handleSharedContributionChange(
                                      item.key,
                                      'erika',
                                      'amount',
                                      event.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  value={plan.erika.frequency}
                                  onChange={(event) =>
                                    handleSharedContributionChange(
                                      item.key,
                                      'erika',
                                      'frequency',
                                      event.target.value,
                                    )
                                  }
                                >
                                  {frequencyOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(erikaAmounts.weekly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(erikaAmounts.fortnightly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(erikaAmounts.monthly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(erikaAmounts.annual)}
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan="17">No shared expenses yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="budget-section">
                <div className="summary-block-header">
                  <h3>Unassigned expenses</h3>
                </div>

                <div className="table-wrap">
                  <table className="budget-table allocation-summary-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Weekly</th>
                        <th>Fortnightly</th>
                        <th>Monthly</th>
                        <th>Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocatedExpenseGroups.Unassigned.length > 0 ? (
                        allocatedExpenseGroups.Unassigned.map((item) => (
                          <tr key={item.key}>
                            <td>{item.description}</td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.weekly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.fortnightly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.monthly)}
                            </td>
                            <td className="calculated-cell">
                              {formatAmount(item.amounts.annual)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No unassigned expenses.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </section>

          <div className="transfer-list">
            {transferSections.map((section) => {
              const totals = calculateSectionTotals(section.rows)
              const remaining =
                section.person === 'Shane'
                  ? calculateDifferenceTotals(shaneIncomeTotals, totals)
                  : calculateDifferenceTotals(erikaIncomeTotals, totals)

              return (
                <article key={section.id} className="budget-section transfer-section">
                  <div className="section-header">
                    <h3>{section.title}</h3>
                    <button
                      type="button"
                      className="section-action"
                      onClick={() => handleAddTransferRow(section.id)}
                    >
                      Add row
                    </button>
                  </div>

                  <div className="table-wrap">
                    <table className="budget-table transfer-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Frequency</th>
                          <th>Weekly</th>
                          <th>Fortnightly</th>
                          <th>Monthly</th>
                          <th>Annual</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((row) => {
                          const amounts = calculateRowAmounts(row)

                          return (
                            <tr key={row.id}>
                              <td className="description-cell">
                                <textarea
                                  rows="3"
                                  className="description-input"
                                  value={row.description}
                                  onChange={(event) =>
                                    handleTransferChange(
                                      section.id,
                                      row.id,
                                      'description',
                                      event.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.amount}
                                  onChange={(event) =>
                                    handleTransferChange(
                                      section.id,
                                      row.id,
                                      'amount',
                                      event.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  value={row.frequency}
                                  onChange={(event) =>
                                    handleTransferChange(
                                      section.id,
                                      row.id,
                                      'frequency',
                                      event.target.value,
                                    )
                                  }
                                >
                                  {frequencyOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(amounts.weekly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(amounts.fortnightly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(amounts.monthly)}
                              </td>
                              <td className="calculated-cell">
                                {formatAmount(amounts.annual)}
                              </td>
                              <td className="actions-cell">
                                <button
                                  type="button"
                                  className="row-delete-button"
                                  onClick={() =>
                                    handleDeleteTransferRow(section.id, row.id)
                                  }
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="subtotal-row">
                          <td colSpan="3">Transfer subtotal</td>
                          <td className="calculated-cell">
                            {formatAmount(totals.weekly)}
                          </td>
                          <td className="calculated-cell">
                            {formatAmount(totals.fortnightly)}
                          </td>
                          <td className="calculated-cell">
                            {formatAmount(totals.monthly)}
                          </td>
                          <td className="calculated-cell">
                            {formatAmount(totals.annual)}
                          </td>
                          <td className="actions-cell" />
                        </tr>
                        <tr className="remaining-row">
                          <td colSpan="3">Remaining after transfers</td>
                          <td className="calculated-cell">
                            {formatAmount(remaining.weekly)}
                          </td>
                          <td className="calculated-cell">
                            {formatAmount(remaining.fortnightly)}
                          </td>
                          <td className="calculated-cell">
                            {formatAmount(remaining.monthly)}
                          </td>
                          <td className="calculated-cell">
                            {formatAmount(remaining.annual)}
                          </td>
                          <td className="actions-cell" />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="transfer-summary">
            <div className="summary-item">
              <span>Remaining after transfers for Shane</span>
              {renderSummaryValues(shaneRemainingTotals)}
            </div>
            <div className="summary-item">
              <span>Remaining after transfers for Erika</span>
              {renderSummaryValues(erikaRemainingTotals)}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
