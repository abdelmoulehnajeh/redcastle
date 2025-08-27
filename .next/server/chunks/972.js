"use strict";exports.id=972,exports.ids=[972],exports.modules={24934:(e,t,i)=>{i.d(t,{$:()=>l,r:()=>s});var a=i(60687),r=i(43210),o=i(8730),n=i(24224),d=i(96241);let s=(0,n.F)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),l=r.forwardRef(({className:e,variant:t,size:i,asChild:r=!1,...n},l)=>{let m=r?o.DX:"button";return(0,a.jsx)(m,{className:(0,d.cn)(s({variant:t,size:i,className:e})),ref:l,...n})});l.displayName="Button"},50848:(e,t,i)=>{i.d(t,{CO:()=>m,CT:()=>I,DY:()=>D,Dl:()=>l,Dx:()=>G,E0:()=>B,G0:()=>h,HR:()=>T,Hw:()=>A,JH:()=>N,Kj:()=>r,MO:()=>R,Mn:()=>W,Nk:()=>F,Pz:()=>_,QY:()=>d,T1:()=>X,Ut:()=>s,V$:()=>n,XB:()=>v,Yh:()=>w,Yo:()=>y,ZU:()=>C,Zt:()=>Y,a4:()=>L,cD:()=>k,dO:()=>u,eU:()=>b,fQ:()=>z,gG:()=>S,iO:()=>$,iv:()=>Q,j2:()=>E,kD:()=>c,kz:()=>x,mO:()=>q,mS:()=>f,mu:()=>H,ng:()=>j,no:()=>O,pP:()=>M,pY:()=>P,rN:()=>V,t:()=>g,uX:()=>o,ve:()=>J,vo:()=>U,xg:()=>p});var a=i(79826);let r=(0,a.J1)`
  mutation DeleteInfraction($id: ID!) {
    deleteInfraction(id: $id)
  }
`,o=(0,a.J1)`
  mutation DeleteAbsence($id: ID!) {
    deleteAbsence(id: $id)
  }
`,n=(0,a.J1)`
  mutation DeleteRetard($id: ID!) {
    deleteRetard(id: $id)
  }
`,d=(0,a.J1)`
  mutation DeleteTenueTravail($id: ID!) {
    deleteTenueTravail(id: $id)
  }
`,s=(0,a.J1)`
  query GetAllUserWorkSchedules($start: String!, $end: String!) {
    allUserWorkSchedules(start: $start, end: $end) {
      id
      employee_id
      date
      start_time
      end_time
      shift_type
      job_position
      is_working
      location_id
      day
      retard
      status
      created_at
      employee {
        id
        nom
        prenom
      }
      location {
        id
        name
        address
      }
    }
  }
`,l=(0,a.J1)`
  mutation CreateUserWorkSchedule($employee_id: ID!, $schedules: [WorkScheduleInput!]!) {
    createUserWorkSchedule(employee_id: $employee_id, schedules: $schedules)
  }
`,m=(0,a.J1)`
 mutation Login($username: String!, $password: String!) {
   login(username: $username, password: $password) {
     id
     username
     role
     employee_id
     location_id
   }
 }
`,p=(0,a.J1)`
 query GetDashboardData($userId: ID!, $role: String!) {
   dashboardStats(userId: $userId, role: $role) {
     monthlyHours
     weeklyHours
     estimatedSalary
     hourlyRate
     remainingLeave
     activeEmployees
     totalEmployees
     totalHours
     pendingRequests
     monthlyRevenue
     revenueGrowth
     recentActivity {
       title
       description
       time
       type
     }
   }
   locations {
     id
     name
     address
     phone
     manager {
       id
       username
       profile {
         first_name
         last_name
       }
     }
     employees {
       id
       username
       status
     }
   }
   employees {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
     user {
       id
       username
       password
     }
     profile {
       first_name
       last_name
       phone
       address
     }
   }
 }
`;(0,a.J1)`
 query GetDashboardStats($userId: ID!, $role: String!) {
   dashboardStats(userId: $userId, role: $role) {
     monthlyHours
     weeklyHours
     estimatedSalary
     hourlyRate
     remainingLeave
     activeEmployees
     totalEmployees
     totalHours
     pendingRequests
     monthlyRevenue
     revenueGrowth
     recentActivity {
       title
       description
       time
       type
     }
   }
 }
`;let _=(0,a.J1)`
 query GetEmployeeDetails($id: ID!) {
   employee(id: $id) {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
       address
     }
     profile {
       first_name
       last_name
       phone
       address
       birth_date
       emergency_contact
     }
     user {
       id
       username
       password
     }
   }
   workSchedules(employee_id: $id) {
     id
     employee_id
     date
     start_time
     end_time
     shift_type
     job_position
     is_working
     created_at
   }
   contracts(employee_id: $id) {
     id
     employee_id
     contract_type
     start_date
     end_date
     salary
     tenu_count
     documents
     created_at
     employee {
       id
       username
       profile {
         first_name
         last_name
       }
     }
   }
 }
`,c=(0,a.J1)`
 query GetAdminData($userId: ID!, $role: String!, $approvalStatus: String) {
   dashboardStats(userId: $userId, role: $role) {
     monthlyHours
     weeklyHours
     estimatedSalary
     hourlyRate
     remainingLeave
     activeEmployees
     totalEmployees
     totalHours
     pendingRequests
     monthlyRevenue
     revenueGrowth
     recentActivity {
       title
       description
       time
       type
     }
   }
   employees {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
     user {
       id
       username
       password
     }
     profile {
       first_name
       last_name
       phone
       address
     }
   }
   locations {
     id
     name
     address
     phone
     manager {
       id
       username
       profile {
         first_name
         last_name
       }
     }
     employees {
       id
       username
       status
     }
   }
   adminApprovals(status: $approvalStatus) {
     id
     type
     reference_id
     manager_id
     data
     status
     created_at
   }
   leaveRequests {
     id
     employee_id
     type
     start_date
     end_date
     reason
     status
     days_count
     manager_comment
     admin_comment
     created_at
     approved_by {
       id
       username
     }
     approved_at
     employee {
       id
       username
       profile {
         first_name
         last_name
       }
     }
   }
 }
`;(0,a.J1)`
 query GetFinanceData($period: String!) {
   employees {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
   }
   locations {
     id
     name
     address
   }
   payrollPayments(period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`,(0,a.J1)`
 query GetJournalData {
   employees {
     id
     username
     email
     nom
     prenom
     job_title
     status
     location {
       id
       name
     }
     profile {
       first_name
       last_name
     }
   }
   locations {
     id
     name
   }
   workSchedules {
     id
     employee_id
     date
     start_time
     end_time
     shift_type
     job_position
     is_working
     created_at
   }
 }
`;let u=(0,a.J1)`
 query GetEmployees($locationId: ID) {
   employees(locationId: $locationId) {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
     }
     user {
       id
       username
       password
     }
     profile {
       first_name
       last_name
       phone
       address
     }
   }
 }
`,$=(0,a.J1)`
 query GetEmployee($id: ID!) {
   employee(id: $id) {
     id
     username
     email
     nom
     prenom
     telephone
     job_title
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
     created_at
     price_h
     location {
       id
       name
       address
     }
     profile {
       first_name
       last_name
       phone
       address
       birth_date
       emergency_contact
     }
   }
 }
`,y=(0,a.J1)`
 query GetTimeEntries($employeeId: ID!, $startDate: String, $endDate: String) {
   timeEntries(employeeId: $employeeId, startDate: $startDate, endDate: $endDate) {
     id
     employee_id
     clock_in
     clock_out
     break_duration
     total_hours
     date
     status
     location {
       id
       name
     }
   }
 }
`,g=(0,a.J1)`
 mutation ClockIn($employeeId: ID!, $locationId: ID!) {
   clockIn(employeeId: $employeeId, locationId: $locationId) {
     id
     clock_in
     status
   }
 }
`,f=(0,a.J1)`
 mutation ClockOut($timeEntryId: ID!) {
   clockOut(timeEntryId: $timeEntryId) {
     id
     clock_out
     total_hours
     status
   }
 }
`,h=(0,a.J1)`
 query GetWorkSchedules($employee_id: ID, $date: String) {
   workSchedules(employee_id: $employee_id, date: $date) {
     id
     employee_id
     date
     start_time
     end_time
     shift_type
     job_position
     is_working
     location_id
     location {
       id
       name
       address
     }
     created_at
   }
 }
`,S=(0,a.J1)`
query GetWorkSchedulesRange($employee_id: ID!) {
  workSchedulesRange(employee_id: $employee_id) {
    id
    employee_id
    date
    shift_type
    is_working
    location_id
    location {
      id
      name
    }
  }
}
`,v=(0,a.J1)`
 mutation CreateWorkSchedule(
   $employee_id: ID!
   $date: String!
   $start_time: String
   $end_time: String
   $shift_type: String!
   $job_position: String!
   $is_working: Boolean!
   $location_id: ID!
 ) {
   createWorkSchedule(
     employee_id: $employee_id
     date: $date
     start_time: $start_time
     end_time: $end_time
     shift_type: $shift_type
     job_position: $job_position
     is_working: $is_working
     location_id: $location_id
   ) {
     id
     employee_id
     date
     start_time
     end_time
     shift_type
     job_position
     is_working
     location_id
     location {
       id
       name
     }
   }
 }
`,b=(0,a.J1)`
 mutation UpdateWorkSchedule(
   $id: ID!
   $start_time: String
   $end_time: String
   $shift_type: String
   $job_position: String
   $is_working: Boolean
   $location_id: ID
 ) {
   updateWorkSchedule(
     id: $id
     start_time: $start_time
     end_time: $end_time
     shift_type: $shift_type
     job_position: $job_position
     is_working: $is_working
     location_id: $location_id
   ) {
     id
     start_time
     end_time
     shift_type
     job_position
     is_working
     location_id
     location {
       id
       name
     }
   }
 }
`,I=(0,a.J1)`
 query GetLeaveRequests($employee_id: ID, $status: String) {
   leaveRequests(employee_id: $employee_id, status: $status) {
     id
     employee_id
     type
     start_date
     end_date
     reason
     status
     days_count
     manager_comment
     admin_comment
     created_at
     approved_by {
       id
       username
     }
     approved_at
     employee {
       id
       username
       profile {
         first_name
         last_name
       }
     }
   }
 }
`,D=(0,a.J1)`
 mutation CreateLeaveRequest(
   $employee_id: ID!
   $type: String!
   $start_date: String!
   $end_date: String!
   $reason: String
 ) {
   createLeaveRequest(
     employee_id: $employee_id
     type: $type
     start_date: $start_date
     end_date: $end_date
     reason: $reason
   ) {
     id
     type
     start_date
     end_date
     reason
     status
     days_count
   }
 }
`,k=(0,a.J1)`
 mutation ApproveLeaveRequest($id: ID!, $status: String!, $comment: String) {
   approveLeaveRequest(id: $id, status: $status, comment: $comment) {
     id
     status
     approved_at
     approved_by {
       id
       username
     }
   }
 }
`,w=(0,a.J1)`
 query GetLocations {
   locations {
     id
     name
     address
     phone
     manager {
       id
       username
       profile {
         first_name
         last_name
       }
     }
     employees {
       id
       username
       status
     }
   }
 }
`,J=(0,a.J1)`
 query GetLocation($id: ID!) {
   location(id: $id) {
     id
     name
     address
     phone
     manager {
       id
       username
       profile {
         first_name
         last_name
       }
     }
     employees {
       id
       username
       email
       nom
       prenom
       telephone
       job_title
       salaire
       status
       created_at
       profile {
         first_name
         last_name
         phone
       }
     }
   }
 }
`;(0,a.J1)`
 query GetLocationDetails($id: ID!) {
   location(id: $id) {
     id
     name
     address
     phone
     manager {
       id
       username
       profile {
         first_name
         last_name
       }
     }
     employees {
       id
       username
       email
       status
       created_at
       profile {
         first_name
         last_name
         phone
       }
     }
   }
 }
`;let j=(0,a.J1)`
 query GetContracts($employee_id: ID) {
   contracts(employee_id: $employee_id) {
     id
     employee_id
     contract_type
     start_date
     end_date
     salary
     tenu_count
     documents
     created_at
     employee {
       id
       username
       profile {
         first_name
         last_name
       }
     }
   }
 }
`,q=(0,a.J1)`
 mutation CreateContract(
   $employee_id: ID!
   $contract_type: String!
   $start_date: String!
   $end_date: String
   $salary: Float!
   $tenu_count: Int
   $documents: [String]
 ) {
   createContract(
     employee_id: $employee_id
     contract_type: $contract_type
     start_date: $start_date
     end_date: $end_date
     salary: $salary
     tenu_count: $tenu_count
     documents: $documents
   ) {
     id
     contract_type
     start_date
     end_date
     salary
     tenu_count
   }
 }
`,R=(0,a.J1)`
 mutation CreateEmployee(
   $username: String!
   $email: String!
   $nom: String!
   $prenom: String!
   $telephone: String
   $job_title: String!
   $salaire: Float
   $role: String
   $location_id: ID
   $price_h: Float
 ) {
   createEmployee(
     username: $username
     email: $email
     nom: $nom
     prenom: $prenom
     telephone: $telephone
     job_title: $job_title
     salaire: $salaire
     role: $role
     location_id: $location_id
     price_h: $price_h
   ) {
     id
     username
     email
     nom
     prenom
     job_title
     status
   }
 }
`,G=(0,a.J1)`
 mutation UpdateEmployee(
   $id: ID!
   $salaire: Float
   $prime: Float
   $avance: Float
   $infractions: Int
   $absence: Int
   $retard: Int
   $tenu_de_travail: Int
   $status: String
   $price_h: Float
 ) {
   updateEmployee(
     id: $id
     salaire: $salaire
     prime: $prime
     avance: $avance
     infractions: $infractions
     absence: $absence
     retard: $retard
     tenu_de_travail: $tenu_de_travail
     status: $status
     price_h: $price_h
   ) {
     id
     salaire
     prime
     avance
     infractions
     absence
     retard
     tenu_de_travail
     status
   }
 }
`,E=(0,a.J1)`
 mutation DeleteEmployee($id: ID!) {
   deleteEmployee(id: $id)
 }
`,x=(0,a.J1)`
 query GetAdminApprovals($status: String) {
   adminApprovals(status: $status) {
     id
     type
     reference_id
     manager_id
     data
     status
     created_at
   }
 }
`,P=(0,a.J1)`
 mutation CreateManagerWorkSchedule(
   $employee_id: ID!
   $shift_type: String!
   $job_position: String!
   $start_time: String!
   $end_time: String!
   $date: String!
   $is_working: Boolean!
 ) {
   createManagerWorkSchedule(
     employee_id: $employee_id
     shift_type: $shift_type
     job_position: $job_position
     start_time: $start_time
     end_time: $end_time
     date: $date
     is_working: $is_working
   ) {
     id
     employee_id
     shift_type
     job_position
     start_time
     end_time
     date
     is_working
     created_at
   }
 }
`,C=(0,a.J1)`
 mutation SendApprovalRequest(
   $type: String!
   $reference_id: ID
   $manager_id: ID
   $data: String!
 ) {
   sendApprovalRequest(
     type: $type
     reference_id: $reference_id
     manager_id: $manager_id
     data: $data
   )
 }
`,A=(0,a.J1)`
 mutation ApproveScheduleChange($approval_id: ID!) {
   approveScheduleChange(approval_id: $approval_id)
 }
`,U=(0,a.J1)`
 mutation RejectScheduleChange($approval_id: ID!, $comment: String) {
   rejectScheduleChange(approval_id: $approval_id, comment: $comment)
 }
`,F=(0,a.J1)`
 query GetPayrollPayments($period: String!) {
   payrollPayments(period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`;(0,a.J1)`
 query GetPayrollPayment($employee_id: ID!, $period: String!) {
   payrollPayment(employee_id: $employee_id, period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`;let W=(0,a.J1)`
 mutation PaySalary($employee_id: ID!, $period: String!) {
   paySalary(employee_id: $employee_id, period: $period) {
     id
     employee_id
     period
     paid
     paid_at
     amount
     hours_worked
   }
 }
`,H=(0,a.J1)`
  query GetNotifications($user_id: ID!, $role: String, $only_unseen: Boolean) {
    notifications(user_id: $user_id, role: $role, only_unseen: $only_unseen) {
      id
      user_id
      role
      title
      message
      type
      reference_id
      seen
      created_at
    }
  }
`,L=(0,a.J1)`
  mutation MarkNotificationSeen($id: ID!) { markNotificationSeen(id: $id) }
`,N=(0,a.J1)`
  mutation MarkAllNotificationsSeen($user_id: ID!) { markAllNotificationsSeen(user_id: $user_id) }
`,T=(0,a.J1)`
  mutation NotifyPlanningForEmployee($employee_id: ID!, $month: String!) {
    notifyPlanningForEmployee(employee_id: $employee_id, month: $month)
  }
`,O=(0,a.J1)`
  mutation UpdateEmployeeProfile(
    $id: ID!
    $nom: String
    $prenom: String
    $email: String
    $telephone: String
    $job_title: String
    $location_id: Int
  ) {
    updateEmployeeProfile(
      id: $id
      nom: $nom
      prenom: $prenom
      email: $email
      telephone: $telephone
      job_title: $job_title
      location_id: $location_id
    ) {
      id
      nom
      prenom
      email
      telephone
      job_title
      location_id
    }
  }
`,B=(0,a.J1)`
  mutation UpdateUserPassword(
    $employee_id: ID!
    $currentPassword: String!
    $newPassword: String!
  ) {
    updateUserPassword(
      employee_id: $employee_id
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      id
      username
    }
  }
`,M=(0,a.J1)`
  mutation UpdateUserInfo(
    $employee_id: ID!
    $username: String
    $hire_date: String
  ) {
    updateUserInfo(
      employee_id: $employee_id
      username: $username
      hire_date: $hire_date
    ) {
      id
      username
      employee_id
    }
  }
`,z=(0,a.J1)`
  query GetEmployeeDisciplinaryData($employee_id: ID!) {
    infractions(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
    absences(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
    retards(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
    tenuesTravail(employee_id: $employee_id) {
      id
      name
      description
      price
      created_date
    }
  }
`,Y=(0,a.J1)`
  mutation CreateInfraction(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createInfraction(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`,X=(0,a.J1)`
  mutation CreateAbsence(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createAbsence(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`,Q=(0,a.J1)`
  mutation CreateRetard(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createRetard(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`,V=(0,a.J1)`
  mutation CreateTenueTravail(
    $employee_id: ID!
    $name: String!
    $description: String
    $price: Float!
  ) {
    createTenueTravail(
      employee_id: $employee_id
      name: $name
      description: $description
      price: $price
    ) {
      id
      name
      description
      price
      created_date
    }
  }
`},68988:(e,t,i)=>{i.d(t,{p:()=>n});var a=i(60687),r=i(43210),o=i(96241);let n=r.forwardRef(({className:e,type:t,...i},r)=>(0,a.jsx)("input",{type:t,className:(0,o.cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",e),ref:r,...i}));n.displayName="Input"}};