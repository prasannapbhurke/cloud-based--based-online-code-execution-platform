import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Terminal, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Database, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw, 
  Server, 
  History, 
  AlertCircle,
  FileCode,
  Zap,
  Lock,
  WifiOff
} from 'lucide-react';

const CODE_TEMPLATES = {
  error_handling: {
    name: '⚠️ Error Handling & Custom Exceptions',
    code: `# Demonstration of comprehensive Python error handling:
# try / except / else / finally & Custom Exception hierarchy

class InsufficientBalanceError(Exception):
    """Raised when an account withdrawal exceeds available balance."""
    def __init__(self, current_balance, withdrawal_amount):
        self.current_balance = current_balance
        self.withdrawal_amount = withdrawal_amount
        super().__init__(
            f"Cannot withdraw \${withdrawal_amount:.2f}. Balance is only \${current_balance:.2f}."
        )

class BankAccount:
    def __init__(self, owner: str, balance: float):
        self.owner = owner
        self.balance = balance

    def withdraw(self, amount: float):
        if amount <= 0:
            raise ValueError("Withdrawal amount must be strictly positive.")
        if amount > self.balance:
            raise InsufficientBalanceError(self.balance, amount)
        self.balance -= amount
        return self.balance

account = BankAccount("Satoshi", 150.00)

test_transactions = [50.00, -20.00, 300.00, "invalid_amount", 50.00]

for idx, tx in enumerate(test_transactions, 1):
    print(f"\\n--- [Transaction #{idx}: Attempting {tx}] ---")
    try:
        # Check type
        if not isinstance(tx, (int, float)):
            raise TypeError(f"Invalid transaction type: {type(tx).__name__}")
        
        remaining = account.withdraw(float(tx))
        print(f"✅ Success! New Balance: \${remaining:.2f}")

    except InsufficientBalanceError as err:
        print(f"❌ Transaction Failed (Custom Exception): {err}")
    except (ValueError, TypeError) as err:
        print(f"❌ Input Validation Error: {err}")
    except Exception as err:
        print(f"❌ Unexpected Error: {err}")
    else:
        print("💡 [else block] Transaction processed cleanly without exceptions.")
    finally:
        print(f"🔒 [finally block] Current Audit Balance: \${account.balance:.2f}")
`
  },
  oop_overriding: {
    name: '🏛️ OOP: Inheritance & Method Overriding',
    code: `# Demonstration of Object-Oriented Programming (OOP):
# Inheritance, Method Overriding, super(), Polymorphism, and Dunder methods

from abc import ABC, abstractmethod

class Employee(ABC):
    """Abstract Base Class demonstrating OOP foundation."""
    def __init__(self, name: str, base_salary: float):
        self.name = name
        self.base_salary = base_salary

    @abstractmethod
    def get_role(self) -> str:
        """Abstract method enforced on subclasses."""
        pass

    def calculate_pay(self) -> float:
        """Default salary calculation."""
        return self.base_salary

    def describe(self) -> str:
        return f"{self.name} ({self.get_role()}): Total Pay = \${self.calculate_pay():,.2f}"

    def __str__(self):
        return f"[{self.get_role()}] {self.name}"

    def __repr__(self):
        return f"Employee(name='{self.name}', base_salary={self.base_salary})"


class SoftwareEngineer(Employee):
    """Subclass inheriting from Employee and overriding methods."""
    def __init__(self, name: str, base_salary: float, tech_stack: list):
        super().__init__(name, base_salary)
        self.tech_stack = tech_stack

    # Method Overriding: specialize role name
    def get_role(self) -> str:
        return "Software Engineer"

    # Method Overriding: add on-call and bonus allowance using super()
    def calculate_pay(self) -> float:
        base = super().calculate_pay()
        bonus = 1500.00  # On-call stipend
        return base + bonus


class EngineeringManager(Employee):
    """Subclass overriding salary with team incentive multipliers."""
    def __init__(self, name: str, base_salary: float, team_size: int):
        super().__init__(name, base_salary)
        self.team_size = team_size

    def get_role(self) -> str:
        return "Engineering Manager"

    def calculate_pay(self) -> float:
        # Overrides calculate_pay: adds team performance bonus
        return super().calculate_pay() + (self.team_size * 500.00)


# Polymorphic execution
team = [
    SoftwareEngineer("Ada Lovelace", 120000, ["Python", "Rust", "Docker"]),
    SoftwareEngineer("Alan Turing", 125000, ["Python", "C++", "Algorithms"]),
    EngineeringManager("Grace Hopper", 150000, team_size=8)
]

print("=== Engineering Department Payroll (Polymorphism Demo) ===")
total_payroll = 0
for member in team:
    print(member.describe())
    total_payroll += member.calculate_pay()

print("-" * 55)
print(f"Total Department Monthly Allocation: \${total_payroll:,.2f}")
`
  },
  decorators: {
    name: '🎨 Decorators & Property Wrappers',
    code: `# Demonstration of Python Decorators:
# Function execution timers, call loggers, and @property decorators

import time
import functools

def benchmark(func):
    """Decorator to measure and log execution time of a function."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        t_start = time.perf_counter()
        result = func(*args, **kwargs)
        t_end = time.perf_counter()
        elapsed_ms = (t_end - t_start) * 1000
        print(f"⏱️  [{func.__name__}] finished in {elapsed_ms:.4f} ms")
        return result
    return wrapper

def validate_positive_args(func):
    """Decorator that validates that all numeric arguments are positive."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        for arg in args:
            if isinstance(arg, (int, float)) and arg < 0:
                raise ValueError(f"Argument {arg} must be non-negative!")
        return func(*args, **kwargs)
    return wrapper

@benchmark
@validate_positive_args
def compute_sum_of_squares(limit: int) -> int:
    return sum(x * x for x in range(limit))

@benchmark
def heavy_string_manipulation(words: list) -> str:
    return " | ".join(w.strip().upper() for w in words if len(w) > 3)

# Test decorated functions
print("--- [1] Testing benchmark & validation decorators ---")
res1 = compute_sum_of_squares(50000)
print(f"Sum of squares: {res1:,}")

print("\\n--- [2] Testing string pipeline decorator ---")
sample_words = ["cloud", "docker", "sandbox", "py", "security", "node", "api"]
res2 = heavy_string_manipulation(sample_words)
print(f"Result: {res2}")
`
  },
  generators: {
    name: '⚡ Generators & Custom Iterators',
    code: `# Demonstration of Memory-Efficient Generators and Iterators in Python:
# yield keyword, generator pipelines, and custom iterator classes

import sys

def prime_generator(limit: int):
    """Generates prime numbers on demand using yield without loading all in RAM."""
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True

    for candidate in range(2, limit + 1):
        if is_prime(candidate):
            yield candidate

# Memory comparison: Generator expression vs List comprehension
large_n = 100000
list_comp = [x * 2 for x in range(large_n)]
gen_exp = (x * 2 for x in range(large_n))

print(f"📦 Memory for full list (100k items): {sys.getsizeof(list_comp):,} bytes")
print(f"⚡ Memory for generator object:        {sys.getsizeof(gen_exp):,} bytes")
print(f"Generator is ~{sys.getsizeof(list_comp) / sys.getsizeof(gen_exp):.1f}x more memory efficient!\\n")

# Consume primes up to 50
print("Primes up to 50 generated via yield:")
primes = list(prime_generator(50))
print(f"Found {len(primes)} primes: {primes}")

# Pipeline processing with generators
def squares(nums):
    for n in nums:
        yield n * n

def only_even(nums):
    for n in nums:
        if n % 2 == 0:
            yield n

print("\\nGenerator streaming pipeline (First 5 even squares):")
pipeline = only_even(squares(prime_generator(30)))
for item in pipeline:
    print(f"-> Streamed value: {item}")
`
  },
  functional: {
    name: '🧩 Functional Programming & Comprehensions',
    code: `# Demonstration of Functional Python:
# map, filter, functools.reduce, lambda, and advanced comprehensions

from functools import reduce

students = [
    {"name": "Alice", "score": 92, "grade": "A", "active": True},
    {"name": "Bob", "score": 68, "grade": "D", "active": False},
    {"name": "Charlie", "score": 85, "grade": "B", "active": True},
    {"name": "Diana", "score": 95, "grade": "A", "active": True},
    {"name": "Ethan", "score": 74, "grade": "C", "active": True},
]

# 1. Filter: active students with score >= 80
honors = list(filter(lambda s: s["active"] and s["score"] >= 80, students))
print("🏆 Honors Students (filter + lambda):")
for s in honors:
    print(f"  - {s['name']}: {s['score']} ({s['grade']})")

# 2. Map: extract names in uppercase
upper_names = list(map(lambda s: s["name"].upper(), students))
print(f"\\n🔠 Mapped Names: {upper_names}")

# 3. Reduce: calculate total and average score
total_score = reduce(lambda acc, s: acc + s["score"], students, 0)
avg_score = total_score / len(students)
print(f"\\n📊 Class Average Score (reduce): {avg_score:.2f}")

# 4. Dictionary Comprehension: student lookup map
student_map = {s["name"]: s["score"] for s in students if s["active"]}
print(f"\\n🗺️  Active Lookup Dict Comprehension:\\n{student_map}")
`
  },
  bst_algorithms: {
    name: '🌲 Binary Search Tree (BST) Algorithm',
    code: `# Implementation of Binary Search Tree (BST)
# Insertion, Search, and In-Order Traversal

class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None

    def insert(self, key):
        if self.root is None:
            self.root = Node(key)
        else:
            self._insert_recursive(self.root, key)

    def _insert_recursive(self, current, key):
        if key < current.key:
            if current.left is None:
                current.left = Node(key)
            else:
                self._insert_recursive(current.left, key)
        elif key > current.key:
            if current.right is None:
                current.right = Node(key)
            else:
                self._insert_recursive(current.right, key)

    def search(self, key):
        return self._search_recursive(self.root, key)

    def _search_recursive(self, current, key):
        if current is None or current.key == key:
            return current
        if key < current.key:
            return self._search_recursive(current.left, key)
        return self._search_recursive(current.right, key)

    def in_order_traversal(self):
        result = []
        self._in_order(self.root, result)
        return result

    def _in_order(self, node, res):
        if node:
            self._in_order(node.left, res)
            res.append(node.key)
            self._in_order(node.right, res)

# Build Tree
bst = BinarySearchTree()
values = [50, 30, 20, 40, 70, 60, 80, 15, 65]
print(f"Inserting into BST: {values}")
for v in values:
    bst.insert(v)

print(f"Sorted traversal (In-Order): {bst.in_order_traversal()}")

for query in [40, 99]:
    found = bst.search(query)
    status = "Found in tree ✅" if found else "Not found ❌"
    print(f"Search for {query}: {status}")
`
  },
  fibonacci: {
    name: '⚡ Fibonacci & Performance',
    code: `# Fibonacci calculation & execution benchmark
import time

def fibonacci(n):
    if n <= 0:
        return []
    series = [0, 1]
    while len(series) < n:
        series.append(series[-1] + series[-2])
    return series[:n]

start_time = time.perf_counter()
print("⚡ Computing Fibonacci Sequence...")
fib_series = fibonacci(20)
end_time = time.perf_counter()

print(f"Result (First 20 terms): {fib_series}")
print(f"Internal calculation time: {(end_time - start_time) * 1000:.4f} ms")
`
  },
  quicksort: {
    name: '🔄 QuickSort Algorithm',
    code: `# QuickSort Algorithm Implementation in Python 3

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

numbers = [64, 34, 25, 12, 22, 11, 90, 88, 45, 1, 102]
print(f"Original list: {numbers}")
sorted_list = quicksort(numbers)
print(f"Sorted list:   {sorted_list}")
`
  },
  interactive: {
    name: '⌨️ Interactive Input (stdin)',
    code: `# Reads inputs provided in the 'Standard Input' tab!

print("Enter your developer name:")
name = input()

print("Enter your favorite programming language:")
lang = input()

print(f"\\n🎉 Hello {name}! Happy coding with {lang} inside AetherCode!")
`
  },
  security_sandbox: {
    name: '🛡️ Sandbox Security Test',
    code: `# Demonstration of container sandbox protections:
# 1. Zero Network Access (blocks outbound SSRF)
# 2. Read-Only Root Filesystem (blocks disk mutation)

import socket

print("--- [1] Checking Network Isolation ---")
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1.0)
    s.connect(("8.8.8.8", 53))
    print("❌ Unexpected: Network was reachable!")
except Exception as e:
    print(f"✅ Secure: Outbound network blocked: {e}")

print("\\n--- [2] Checking Read-Only Filesystem ---")
try:
    with open('/etc/malicious_payload.txt', 'w') as f:
        f.write("Exploit")
    print("❌ Unexpected: Wrote to root filesystem!")
except Exception as e:
    print(f"✅ Secure: Root filesystem write prevented: {e}")

print("\\nSandbox protection checks complete!")
`
  },
  timeout_test: {
    name: '⏱️ Timeout Kill Switch Demo',
    code: `# Demonstrates the automated kill switch for infinite loops:
import time

print("Starting task with potential infinite loop...")
count = 0
while True:
    count += 1
    # This loop will be forcibly terminated when the execution timeout expires!
`
  },
  zero_division: {
    name: '➗ Safe Division & Arithmetic Errors',
    code: `# 1. Safe Division & Arithmetic Exceptions
# Catches ZeroDivisionError and TypeError with clean fallbacks

def safe_divide(numerator, denominator):
    try:
        print(f"Calculating: {numerator} / {denominator}")
        result = numerator / denominator
    except ZeroDivisionError:
        print("❌ Cannot divide by zero!")
        return None
    except TypeError as err:
        print(f"❌ Type mismatch error: {err}")
        return None
    else:
        print(f"✅ Calculation successful: {result:.4f}")
        return result
    finally:
        print("--- [Operation logged] ---")

# Test cases
test_cases = [(100, 4), (50, 0), (10, "two"), (7, 3)]
for num, den in test_cases:
    safe_divide(num, den)
`
  },
  file_not_found: {
    name: '📂 File I/O & FileNotFoundError',
    code: `# 2. File I/O & Missing Resource Exception
# Handles FileNotFoundError gracefully and falls back to in-memory buffers

import io

def read_config_file(filepath):
    try:
        print(f"Attempting to open config: '{filepath}'...")
        with open(filepath, 'r') as f:
            return f.read()
    except FileNotFoundError:
        print(f"⚠️  File '{filepath}' not found on disk.")
        print("💡 Falling back to in-memory default configuration buffer...")
        
        # Fallback using in-memory string stream
        default_buffer = io.StringIO("HOST=127.0.0.1\\nPORT=8080\\nDEBUG=true")
        return default_buffer.read()

config_data = read_config_file("non_existent_app_config.env")
print("\\nActive Configuration:")
print(config_data)
`
  },
  key_index_bounds: {
    name: '🔍 Dict & List Boundary Exceptions',
    code: `# 3. Boundary Errors: IndexError & KeyError
# Compares risky index lookups vs safe defensive methods

# List indexing
fruits = ["Apple", "Banana", "Cherry"]
print(f"Fruits list: {fruits}")

try:
    print("Attempting to access index 5...")
    print(fruits[5])
except IndexError as err:
    print(f"❌ Caught IndexError: {err}")
    print(f"✅ Safe fallback: Index is out of bounds (length is {len(fruits)})")

# Dictionary key lookup
user_profile = {"username": "alex99", "role": "admin"}
print(f"\\nUser profile: {user_profile}")

try:
    print("Attempting to access missing key 'email' directly...")
    print(user_profile["email"])
except KeyError as err:
    print(f"❌ Caught KeyError for missing key: {err}")
    print(f"✅ Safe fallback using .get(): '{user_profile.get('email', 'no-email@domain.com')}'")
`
  },
  stack_underflow: {
    name: '🥞 Stack with Underflow Exception',
    code: `# 4. Stack Data Structure with Custom Underflow Exception
# Demonstrates LIFO (Last-In-First-Out) with bounds enforcement

class StackUnderflowError(Exception):
    """Raised when attempting to pop or peek from an empty stack."""
    pass

class SimpleStack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)
        print(f"Pushed: {item} (Stack size: {len(self._items)})")

    def pop(self):
        if self.is_empty():
            raise StackUnderflowError("Cannot pop from an empty stack!")
        return self._items.pop()

    def is_empty(self):
        return len(self._items) == 0

stack = SimpleStack()

# Push items
stack.push("Task A")
stack.push("Task B")

# Pop items
print(f"Popped: {stack.pop()}")
print(f"Popped: {stack.pop()}")

# Attempt to pop from empty stack
try:
    print("\\nAttempting to pop again from empty stack...")
    stack.pop()
except StackUnderflowError as err:
    print(f"❌ Caught Exception: {err}")
`
  },
  palindrome_checker: {
    name: '🔁 Palindrome Checker & Validation',
    code: `# 5. Palindrome Checker with Type Validation
# Uses string slicing and cleans punctuation, handling bad inputs

import string

def is_palindrome(text):
    if not isinstance(text, str):
        raise TypeError(f"Expected a string, got {type(text).__name__}")
    
    # Clean text: lowercase and remove spaces & punctuation
    clean = [ch.lower() for ch in text if ch.isalnum()]
    return clean == clean[::-1]

samples = [
    "A man, a plan, a canal: Panama",
    "Was it a car or a cat I saw?",
    "Hello World",
    12321  # Invalid type to test exception
]

for sample in samples:
    try:
        result = is_palindrome(sample)
        status = "Palindrome! 🎉" if result else "Not a palindrome"
        print(f"'{sample}' -> {status}")
    except TypeError as err:
        print(f"❌ Error on input {sample}: {err}")
`
  },
  prime_factors: {
    name: '🔢 Prime Factorization & Input Check',
    code: `# 6. Prime Factorization with Input Validation
# Factors a number into its prime components, verifying positive integers

def get_prime_factors(n):
    if not isinstance(n, int):
        raise TypeError("Input must be an integer.")
    if n <= 1:
        raise ValueError(f"Number must be greater than 1 (received {n}).")

    factors = []
    divisor = 2
    temp = n
    while divisor * divisor <= temp:
        while temp % divisor == 0:
            factors.append(divisor)
            temp //= divisor
        divisor += 1
    if temp > 1:
        factors.append(temp)
    return factors

for test_num in [84, 315, 13, -5, "100"]:
    try:
        print(f"\\nFactoring: {test_num}")
        facts = get_prime_factors(test_num)
        print(f"✅ Prime factors of {test_num} = {facts}")
    except (ValueError, TypeError) as err:
        print(f"❌ Validation Error: {err}")
`
  },
  matrix_multiplier: {
    name: '📐 Matrix Multiplication & Dimension Check',
    code: `# 7. Matrix Multiplication with Dimension Mismatch Exception
# Multiplies two 2D matrices and validates algebraic compatibility

class DimensionMismatchError(Exception):
    pass

def multiply_matrices(matrix_a, matrix_b):
    rows_a, cols_a = len(matrix_a), len(matrix_a[0])
    rows_b, cols_b = len(matrix_b), len(matrix_b[0])

    if cols_a != rows_b:
        raise DimensionMismatchError(
            f"Cannot multiply: Columns of A ({cols_a}) must match Rows of B ({rows_b})."
        )

    # Initialize result matrix
    result = [[0 for _ in range(cols_b)] for _ in range(rows_a)]

    for i in range(rows_a):
        for j in range(cols_b):
            for k in range(cols_a):
                result[i][j] += matrix_a[i][k] * matrix_b[k][j]

    return result

# Matrix A: 2x3
A = [
    [1, 2, 3],
    [4, 5, 6]
]

# Matrix B: 3x2 (Compatible)
B = [
    [7, 8],
    [9, 1],
    [2, 3]
]

# Matrix C: 2x2 (Incompatible with A)
C = [
    [1, 0],
    [0, 1]
]

print("--- [Test 1: Valid Multiplication (A x B)] ---")
res = multiply_matrices(A, B)
for row in res:
    print(row)

print("\\n--- [Test 2: Incompatible Multiplication (A x C)] ---")
try:
    multiply_matrices(A, C)
except DimensionMismatchError as err:
    print(f"❌ Error: {err}")
`
  },
  regex_validator: {
    name: '📧 RegEx Email & Format Validator',
    code: `# 8. Email & Format Validation with RegEx
# Validates string format and raises specific validation errors

import re

class InvalidEmailFormatError(ValueError):
    pass

def validate_user_email(email_str):
    if not isinstance(email_str, str):
        raise TypeError("Email must be a string.")
    
    # RFC 5322 simplified pattern
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
    if not re.match(pattern, email_str.strip()):
        raise InvalidEmailFormatError(f"'{email_str}' is not a valid email address.")
    
    return email_str.strip().lower()

test_emails = [
    "developer@cloudsandbox.io",
    "user.name+tag@sub.domain.org",
    "missing_at_symbol.com",
    "user@bad_domain",
    12345
]

for item in test_emails:
    try:
        valid_email = validate_user_email(item)
        print(f"✅ Valid email: {valid_email}")
    except InvalidEmailFormatError as err:
        print(f"❌ Format Error: {err}")
    except TypeError as err:
        print(f"❌ Type Error: {err}")
`
  },
  json_parser: {
    name: '📄 Safe JSON Parser & JSONDecodeError',
    code: `# 9. Safe JSON Parser & Syntax Error Handling
# Handles json.JSONDecodeError with specific error line and column info

import json

def parse_json_safely(raw_text):
    try:
        data = json.loads(raw_text)
        print("✅ JSON parsed successfully:")
        print(json.dumps(data, indent=2))
        return data
    except json.JSONDecodeError as err:
        print(f"❌ JSON Syntax Error at line {err.lineno}, column {err.colno}:")
        print(f"   Message: {err.msg}")
        return None

# Test 1: Valid JSON
valid_payload = '{"service": "AetherCode", "status": "online", "port": 5000}'
print("--- [Parsing Valid JSON] ---")
parse_json_safely(valid_payload)

# Test 2: Malformed JSON (missing closing quote & bracket)
malformed_payload = '{"service": "AetherCode, "status": "online"'
print("\\n--- [Parsing Malformed JSON] ---")
parse_json_safely(malformed_payload)
`
  },
  retry_backoff: {
    name: '🔄 Retry Mechanism & Exponential Backoff',
    code: `# 10. Transient Error Retry Loop with Backoff
# Retries an intermittent failure up to max_attempts before raising

import time
import random

class ServiceUnavailableError(Exception):
    pass

class MaxRetriesExceededError(Exception):
    pass

def simulate_flaky_network_request():
    # 70% chance of failure to test retries
    if random.random() < 0.7:
        raise ServiceUnavailableError("503 Service Temporarily Unavailable")
    return {"status": 200, "data": "Payment transaction processed"}

def execute_with_retry(operation, max_attempts=4):
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"🔄 Attempt #{attempt} executing...")
            response = operation()
            print(f"✅ Success on attempt #{attempt}!")
            return response
        except ServiceUnavailableError as err:
            print(f"⚠️  Transient failure: {err}")
            if attempt == max_attempts:
                raise MaxRetriesExceededError(
                    f"Operation aborted after {max_attempts} failed attempts."
                ) from err
            
            backoff_delay = 0.3 * (2 ** (attempt - 1))
            print(f"⏳ Backing off for {backoff_delay:.2f}s before retry...")
            time.sleep(backoff_delay)

try:
    execute_with_retry(simulate_flaky_network_request, max_attempts=4)
except MaxRetriesExceededError as final_err:
    print(f"❌ Final Failure: {final_err}")
`
  }
};

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState('error_handling');
  const [code, setCode] = useState(CODE_TEMPLATES.error_handling.code);
  const [stdin, setStdin] = useState('');
  const [timeoutSec, setTimeoutSec] = useState(7);
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'stdin' | 'security' | 'history'
  
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [serverHealth, setServerHealth] = useState(null);

  // Check backend server health
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerStatus('online');
        setServerHealth(data);
      } else {
        setServerStatus('offline');
      }
    } catch (e) {
      setServerStatus('offline');
    }
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) {
          handleExecute();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, stdin, timeoutSec, isRunning]);

  const handleTemplateChange = (e) => {
    const key = e.target.value;
    setSelectedTemplate(key);
    setCode(CODE_TEMPLATES[key].code);
    if (key === 'interactive') {
      setStdin("Alice\nPython");
      setActiveTab('stdin');
    }
  };

  const handleExecute = async () => {
    if (!code.trim() || isRunning) return;

    setIsRunning(true);
    setActiveTab('output');
    const startTime = Date.now();

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'python',
          stdin,
          timeoutMs: timeoutSec * 1000
        })
      });

      const data = await response.json();
      setResult(data);

      // Add to history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        status: data.status,
        executionTimeMs: data.executionTimeMs,
        preview: data.stdout ? data.stdout.slice(0, 80) : (data.stderr ? data.stderr.slice(0, 80) : 'No output'),
        codeSnippet: code.slice(0, 100)
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]);
    } catch (err) {
      setResult({
        status: 'error',
        exitCode: 1,
        stdout: '',
        stderr: `Network / Gateway Error: ${err.message}`,
        executionTimeMs: Date.now() - startTime
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyOutput = () => {
    const content = (result?.stdout || '') + (result?.stderr ? `\n${result.stderr}` : '');
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClearOutput = () => {
    setResult(null);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={18} />
          </div>
          <span className="brand-text">AetherCode</span>
          <span className="brand-badge">Docker Sandbox</span>
        </div>

        <div className="nav-actions">
          {/* Server Connection Status */}
          <div className="status-pill" title={serverStatus === 'online' ? 'Backend Docker sandbox connected' : 'Connecting to sandbox backend...'}>
            <span className={`status-dot ${serverStatus === 'online' ? 'status-online' : (serverStatus === 'checking' ? 'status-busy' : 'status-offline')}`} />
            <span>{serverStatus === 'online' ? 'Engine Online' : (serverStatus === 'checking' ? 'Checking...' : 'Engine Disconnected')}</span>
          </div>

          {/* Timeout Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Clock size={14} />
            <select 
              value={timeoutSec} 
              onChange={(e) => setTimeoutSec(Number(e.target.value))}
              className="template-select"
              title="Execution timeout limit"
            >
              <option value={3}>Timeout: 3s</option>
              <option value={5}>Timeout: 5s</option>
              <option value={7}>Timeout: 7s</option>
              <option value={10}>Timeout: 10s</option>
            </select>
          </div>

          {/* Run Button */}
          <button 
            className="btn-run" 
            onClick={handleExecute} 
            disabled={isRunning || serverStatus === 'offline'}
            title="Execute Code (Ctrl + Enter)"
          >
            <Play size={16} fill="currentColor" />
            <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
            <span className="shortcut-pill">Ctrl+↵</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split */}
      <main className="main-workspace">
        {/* Left Side: Code Editor */}
        <section className="editor-panel">
          <div className="panel-header">
            <div className="panel-title">
              <FileCode size={16} color="var(--accent-cyan)" />
              <span>main.py</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Preset:</span>
              <select 
                value={selectedTemplate} 
                onChange={handleTemplateChange}
                className="template-select"
              >
                <optgroup label="⚠️ Exception Handling & Core">
                  <option value="error_handling">{CODE_TEMPLATES.error_handling.name}</option>
                  <option value="zero_division">{CODE_TEMPLATES.zero_division.name}</option>
                  <option value="file_not_found">{CODE_TEMPLATES.file_not_found.name}</option>
                  <option value="key_index_bounds">{CODE_TEMPLATES.key_index_bounds.name}</option>
                  <option value="stack_underflow">{CODE_TEMPLATES.stack_underflow.name}</option>
                  <option value="palindrome_checker">{CODE_TEMPLATES.palindrome_checker.name}</option>
                  <option value="prime_factors">{CODE_TEMPLATES.prime_factors.name}</option>
                  <option value="matrix_multiplier">{CODE_TEMPLATES.matrix_multiplier.name}</option>
                  <option value="regex_validator">{CODE_TEMPLATES.regex_validator.name}</option>
                  <option value="json_parser">{CODE_TEMPLATES.json_parser.name}</option>
                  <option value="retry_backoff">{CODE_TEMPLATES.retry_backoff.name}</option>
                </optgroup>
                <optgroup label="🏛️ OOP & Advanced Python">
                  <option value="oop_overriding">{CODE_TEMPLATES.oop_overriding.name}</option>
                  <option value="decorators">{CODE_TEMPLATES.decorators.name}</option>
                  <option value="generators">{CODE_TEMPLATES.generators.name}</option>
                  <option value="functional">{CODE_TEMPLATES.functional.name}</option>
                </optgroup>
                <optgroup label="📊 Algorithms & Data Structures">
                  <option value="bst_algorithms">{CODE_TEMPLATES.bst_algorithms.name}</option>
                  <option value="quicksort">{CODE_TEMPLATES.quicksort.name}</option>
                  <option value="fibonacci">{CODE_TEMPLATES.fibonacci.name}</option>
                </optgroup>
                <optgroup label="🛡️ Interactive & Sandbox Tests">
                  <option value="interactive">{CODE_TEMPLATES.interactive.name}</option>
                  <option value="security_sandbox">{CODE_TEMPLATES.security_sandbox.name}</option>
                  <option value="timeout_test">{CODE_TEMPLATES.timeout_test.name}</option>
                </optgroup>
              </select>

              <button 
                className="btn-secondary" 
                onClick={() => setCode(CODE_TEMPLATES[selectedTemplate].code)}
                title="Reset to original template code"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                padding: { top: 12, bottom: 12 },
                lineNumbersMinChars: 3
              }}
            />
          </div>
        </section>

        {/* Right Side: Output & Console Panel */}
        <section className="console-panel">
          {/* Tab Navigation */}
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'output' ? 'active' : ''}`}
              onClick={() => setActiveTab('output')}
            >
              <Terminal size={14} />
              <span>Console Output</span>
              {result && (
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '1px 5px', 
                  borderRadius: '10px', 
                  backgroundColor: result.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: result.status === 'success' ? 'var(--accent-green)' : 'var(--accent-rose)'
                }}>
                  {result.status}
                </span>
              )}
            </button>

            <button 
              className={`tab-btn ${activeTab === 'stdin' ? 'active' : ''}`}
              onClick={() => setActiveTab('stdin')}
            >
              <Database size={14} />
              <span>Standard Input (stdin)</span>
              {stdin.trim() && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)' }} />
              )}
            </button>

            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <ShieldCheck size={14} />
              <span>Sandbox Isolation</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>History ({history.length})</span>
            </button>
          </div>

          {/* Tab 1: Console Output */}
          {activeTab === 'output' && (
            <div className="tab-content">
              <div className="terminal-window">
                <div className="terminal-topbar">
                  <div className="terminal-dots">
                    <span className="dot dot-red"></span>
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                  </div>

                  <div className="terminal-metrics">
                    {result?.executionTimeMs !== undefined && (
                      <div className="metric-tag">
                        <Clock size={13} color="var(--accent-cyan)" />
                        <span>{result.executionTimeMs} ms</span>
                      </div>
                    )}
                    {result?.exitCode !== undefined && (
                      <div className="metric-tag">
                        <span>Exit: {result.exitCode}</span>
                      </div>
                    )}

                    <button 
                      className="btn-secondary" 
                      onClick={handleCopyOutput}
                      disabled={!result}
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      title="Copy output"
                    >
                      {copied ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button 
                      className="btn-secondary" 
                      onClick={handleClearOutput}
                      disabled={!result}
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      title="Clear console"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="terminal-body">
                  {isRunning ? (
                    <div className="terminal-empty">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span className="status-dot status-busy"></span>
                        Spawning isolated container & executing Python code...
                      </span>
                    </div>
                  ) : result ? (
                    <>
                      {result.stdout && (
                        <div className="stdout-text">{result.stdout}</div>
                      )}
                      {result.stderr && (
                        <div className="stderr-text">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px' }}>
                            <AlertCircle size={14} />
                            <span>Standard Error / Runtime Diagnostic:</span>
                          </div>
                          {result.stderr}
                        </div>
                      )}
                      {!result.stdout && !result.stderr && (
                        <div className="terminal-empty">Process finished with exit code {result.exitCode} (No output produced).</div>
                      )}
                    </>
                  ) : (
                    <div className="terminal-empty">
                      Click "Run Code" or press Ctrl+Enter to execute in cloud sandbox.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Standard Input */}
          {activeTab === 'stdin' && (
            <div className="tab-content">
              <div className="stdin-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Provide inputs to be piped into <code>sys.stdin</code> or <code>input()</code> calls:
                  </span>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setStdin('')}
                    style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                  >
                    Clear Stdin
                  </button>
                </div>
                <textarea 
                  className="stdin-textarea"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input lines here (each line corresponds to an input() call)..."
                />
              </div>
            </div>
          )}

          {/* Tab 3: Sandbox Security & Isolation Specifications */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="security-grid">
                <div className="security-card">
                  <div className="security-card-header">
                    <WifiOff size={16} color="var(--accent-cyan)" />
                    <span>Network Isolation</span>
                  </div>
                  <p className="security-card-desc">
                    Containers run with <code>--network none</code>. All outgoing socket connections, SSRF attacks, and exfiltration attempts are blocked.
                  </p>
                  <span className="security-badge">isolated (zero egress)</span>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <Cpu size={16} color="var(--accent-indigo)" />
                    <span>CPU Quota</span>
                  </div>
                  <p className="security-card-desc">
                    Execution throttled to 0.5 CPU core to guarantee host fairness and prevent CPU hijacking/crypto-mining attacks.
                  </p>
                  <span className="security-badge">0.5 Cores (50% quota)</span>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <Database size={16} color="var(--accent-green)" />
                    <span>Memory Boundary</span>
                  </div>
                  <p className="security-card-desc">
                    Hard cgroup limit of 128 MB RAM. Any attempt to allocate unbounded memory is safely intercepted by Linux OOM killer.
                  </p>
                  <span className="security-badge">128 MB RAM max</span>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <Lock size={16} color="var(--accent-amber)" />
                    <span>Read-Only Root FS</span>
                  </div>
                  <p className="security-card-desc">
                    Container root filesystem is mounted strictly read-only with a temporary ephemeral 16MB tmpfs buffer on <code>/tmp</code>.
                  </p>
                  <span className="security-badge">read-only root</span>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <Clock size={16} color="var(--accent-rose)" />
                    <span>Watchdog Kill Switch</span>
                  </div>
                  <p className="security-card-desc">
                    Configurable timeout watchdog terminates long-running code or infinite loops via SIGKILL and container termination.
                  </p>
                  <span className="security-badge">{timeoutSec}s timeout threshold</span>
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <Server size={16} color="#a855f7" />
                    <span>Ephemeral Containers</span>
                  </div>
                  <p className="security-card-desc">
                    Each execution spawns an isolated container that is completely removed upon termination with zero residue.
                  </p>
                  <span className="security-badge">Docker alpine unprivileged</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Execution History */}
          {activeTab === 'history' && (
            <div className="tab-content">
              {history.length === 0 ? (
                <div className="terminal-empty">No executions recorded in this session.</div>
              ) : (
                <div className="history-list">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className="history-item"
                      onClick={() => setActiveTab('output')}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            padding: '1px 6px', 
                            borderRadius: '4px',
                            background: item.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: item.status === 'success' ? 'var(--accent-green)' : 'var(--accent-rose)',
                            fontWeight: 600
                          }}>
                            {item.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                            {item.executionTimeMs} ms
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.preview}
                        </div>
                      </div>
                      <span className="history-time">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
