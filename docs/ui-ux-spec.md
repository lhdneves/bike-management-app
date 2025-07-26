# Bicycle Maintenance, Expense, and Component Control Management System UI/UX Specification

## 1. Introduction

The purpose of this document is to outline the user interface and user experience design for the "Bicycle Maintenance, Expense, and Component Control Management System," ensuring it aligns with the project goals, user needs, and functional requirements defined in the PRD. Our focus will be on creating an intuitive, efficient, and visually appealing experience for bicycle owners and mechanics.

## 2. User Profiles / Personas

### Persona 1: Bernardo, The Mountain Biker

* **Name & Role:** Bernardo, an adult who loves nature cycling. He owns a mountain bike and rides trails with friends once or twice a week.
* **Pain Points:**
    * Mountain bikes require frequent maintenance due to exposure to sand, mud, and grass on trails, stressing components like the drivetrain, suspension, brakes, and tires.
    * Lack of proper maintenance tracking leads to delayed servicing, potentially increasing repair costs (replacing parts instead of just fixing).
    * Conversely, without good control, he might take his bike for maintenance too early, also incurring unnecessary costs.
* **Goals with the Application:**
    * Register his bike(s).
    * Effectively control maintenance schedules and component lifespan (tires, chain, drivetrain, etc.).
    * Gain insight into costs over time.
    * Locate mechanics in his region.
    * View relevant advertisement banners.
* **Technical Proficiency:** Proficient in using applications and systems.
* **Typical Use Cases:** Will use the application via notebook or smartphone.

### Persona 2: Leonardo, The Bicycle Mechanic

* **Name & Role:** Leonardo, a bicycle mechanic who works in a small neighborhood shop. He services all types of bikes.
* **Pain Points:**
    * Lacks digital presence and relies primarily on word-of-mouth for customers.
    * Has difficulty being known by bike owners in the city.
* **Goals with the Application:**
    * Increase visibility among bike owners to boost his revenue.
    * Register his workshop to be found by bike owners.
* **Technical Proficiency:** Reasonable technical proficiency; comfortable using applications.
* **Typical Use Cases:** Tends to use the system on smartphones, as he typically doesn't have notebooks or desktops.

## 3. User Flows (Detailed)

### Flow 1: User Registration & Login Flow

* **User Goal:** Register in the system and then log in to access the application.
* **Entry Point:** User accesses the application link (or downloads the app), and upon launching, encounters the login & registration screen.
* **Steps:**
    1.  User opts for the **CADASTRO** (Registration) option.
    2.  User enters information: name, email (repeat for confirmation), phone, password (repeat for confirmation).
    3.  User accepts the Terms & Conditions.
    4.  User clicks the "Efetuar o Cadastro" (Perform Registration) button.
    5.  Upon successful registration, the system returns to the login screen.
    6.  System prompts for login credentials (email) and password.
    7.  User enters login and password.
    8.  System allows user entry.
    9.  *Password Recovery:* If the user forgets their password, they can select the "Esqueci minha senha" (Forgot my password) option. The system will ask for their email and send an email with renewal instructions.
* **Exit Point:** Upon successful login, the user is directed to the system's dashboard.
* **Error States/Handling:** The system must display clear messages for errors such as: "login/senha incorretos" (incorrect login/password), "email já cadastrado" (email already registered), etc.

### Flow 2: Bike Registration Flow

* **User Goal:** Register their bicycle to manage its components and maintenance.
* **Entry Point:** The user selects a dedicated card or option to add new bikes from the dashboard.
* **Steps:**
    1.  Upon opening the screen, the user enters the **bike name** (mandatory).
    2.  User provides a **brief description**.
    3.  User selects the **manufacturer** from a list.
    4.  User selects the **type** (e.g., Speed, Mountain Bike).
    5.  User selects the **traction** (e.g., Manual, Electric).
    6.  Upon completion, the user can choose to "Cancel" or "Save".
* **Exit Point:** Upon saving, the system returns to the dashboard.
* **Error States/Handling:** The system must display clear error messages such as: "Bike already exists with this name," "Bike name is mandatory," etc.

### Flow 3: Maintenance Management Flow

* **User Goal:** Allow the user to record maintenance performed on their bike.
* **Entry Point:** Upon clicking a specific bike, the system opens a card with bike details and options. One option will be "Registrar Manutenções" (Register Maintenance). Clicking this option opens a modal for the user to input data.
* **Steps:**
    1.  Upon entering the screen/modal, the user must provide the **maintenance date**, the **mechanic** who performed the activity, a **description of the service**, and the **total value** (all fields are mandatory, except for the value).
    2.  After filling out these fields, the system displays "Salvar" (Save) and "Cancelar" (Cancel) buttons.
* **Exit Point:** Upon saving or canceling, the system returns to the previous screen.
* **Error States/Handling:** The system must display clear error messages, for example: "campo obrigatório" (mandatory field), "erro ao salvar" (error saving), etc.

## 4. Wireframes / Mockups (High-Level)

### Screen 1: Login/Registration Screen

* **Layout:** A large central card containing the input fields and buttons.
* **Elements:**
    * Input field for "Login" with a placeholder.
    * Input field for "Password" with a placeholder.
    * "Entrar" (Enter) button.
    * "Novo Cadastro" (New Registration) option/link, positioned directly below the "Entrar" button.
    * "Esqueci minha senha" (Forgot my password) option/link, positioned directly below "Novo Cadastro".

### Screen 2: Dashboard Screen

* **Layout:**
    * Top-left: Hamburger menu icon.
    * Top of screen: Greeting message with the user's name (e.g., "Olá, [Nome do Usuário]!").
    * Main central area: Space for a banner carousel.
    * Below banners: Area for displaying bike cards.
* **Elements:**
    * **Hamburger Menu:**
        * "Perfil" (Profile) option.
        * "Localizar Mecânicos" (Locate Mechanics) option.
        * "Sair" (Logout) option.
    * **Banner Carousel:** Displays advertisements from suppliers.
    * **Bike Cards:**
        * If bikes are registered: A card for each registered bicycle, likely showing key info (e.g., bike name, type).
        * If no bikes are registered: A single card with an option to "Cadastrar a primeira bicicleta" (Register the first bicycle).

### Screen 3: Bike Details Screen

* **Layout:**
    * **Top Section:**
        * Buttons for "Componentes" (Components), "Manutenções" (Maintenance), and "Agendamento" (Scheduling) prominently displayed at the top of the screen.
        * Top-right corner: A "three dots" (...) icon.
            * Sub-options when clicked: "Editar" (Edit) and "Deletar" (Delete).
    * **Main Content Area (Implicit):** This area will display the specific details of the selected bike, including:
        * Bike Name, Description, Manufacturer, Type, and Traction (displayed as static text/values).
        * A summary or list of its associated components.
        * A summary or list of its maintenance history.
    * **Bottom Section:**
        * "Fechar" (Close) button to exit the screen.

### Screen 4: Maintenance Log Screen

* **User Goal:** View a history of maintenance and add new entries.
* **Layout:**
    * **Main Content Area:** Displays a summary list of all previously registered maintenance activities. Each item in the list would likely show key details like date, service performed, and cost.
    * **Top Section:** An option/button to "Abrir uma nova manutenção" (Open a new maintenance).
* **Interaction (Add New Maintenance):**
    * **Entry Point:** Clicking the "Abrir uma nova manutenção" option.
    * **New Screen/Modal:** Opens a dedicated screen or modal.
        * **Elements:** Input fields for "Data" (date), "Mecânico" (mechanic), "Descrição do Serviço" (service description), and "Valor" (value).
        * **Actions:** "Salvar" (Save) and "Cancelar" (Cancel) buttons.
    * **Exit Point:** Upon saving or canceling, returns to the Maintenance Log Screen.

### Screen 5: Mechanic List Screen

* **User Goal:** Locate bicycle mechanics in the city and view their details.
* **Layout:**
    * **Main Content Area:** Displays a list of mechanics available in the city.
    * **Top Section:** An option/button to "Visualizar no mapa" (View on map) for these mechanics.
* **Interaction (View Mechanic Details):**
    * **Entry Point:** User selects a mechanic from the list.
    * **Display:** The system should present the selected mechanic's details: "Nome" (Name), "Endereço" (Address), and "Telefone" (Phone).

## 5. Interaction Design Principles

1.  **Modern Aesthetic & Energetic Visuals:** The system should have a modern look and feel, utilizing colors that inspire energy and movement.
2.  **Clear Error Messaging:** The system must present very clear and understandable error messages.
3.  **User Feedback Mechanism:** Provide users with an option to give feedback.