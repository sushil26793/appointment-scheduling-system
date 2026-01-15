const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

// Test user credentials
const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Test@123456'
};

let authToken = '';
let appointmentId = '';

// Helper function to log results
function logResult(testName, success, data, error = null) {
    const separator = '='.repeat(60);
    let output = `\n${separator}\n`;
    output += `TEST: ${testName}\n`;
    output += `${separator}\n`;

    if (success) {
        output += '✅ SUCCESS\n';
        output += `Response: ${JSON.stringify(data, null, 2)}\n`;
    } else {
        output += '❌ FAILED\n';
        const errorDetail = error?.response?.data || error?.message || error;
        output += `Error: ${typeof errorDetail === 'object' ? JSON.stringify(errorDetail, null, 2) : errorDetail}\n`;
        if (error?.stack) {
            output += `Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}\n`;
        }
    }

    console.log(output);
}

// Test functions
async function testHealthCheck() {
    try {
        const response = await axios.get('http://127.0.0.1:5000/health');
        logResult('Health Check', true, response.data);
        return true;
    } catch (error) {
        logResult('Health Check', false, null, error);
        return false;
    }
}

async function testRegister() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
        authToken = response.data.data.token;
        logResult('User Registration', true, response.data);
        return true;
    } catch (error) {
        logResult('User Registration', false, null, error);
        return false;
    }
}

async function testLogin() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        authToken = response.data.data.token;
        logResult('User Login', true, response.data);
        return true;
    } catch (error) {
        logResult('User Login', false, null, error);
        return false;
    }
}

async function testGetAvailableSlots() {
    try {
        const response = await axios.get(`${BASE_URL}/appointments/available`);
        const slots = response.data.data || [];

        logResult('Get Available Slots', true, {
            totalSlots: slots.length,
            firstFewSlots: slots.slice(0, 3)
        });

        // For cancellation test, we need a slot at least 24 hours away
        const now = new Date();

        const validSlot = slots.find(slot => {
            if (slot.status !== 'available') return false;

            const [year, month, day] = slot.date.split('-').map(Number);
            const [hour, minute] = slot.startTime.split(':').map(Number);
            const slotDate = new Date(year, month - 1, day, hour, minute);

            const diffHours = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            return diffHours >= 24.5; // Use 24.5 to be safe
        });

        if (validSlot) {
            appointmentId = validSlot._id;
            console.log(`\n📅 Selected slot for booking/cancellation: ${appointmentId} (${validSlot.date} ${validSlot.startTime})\n`);
        } else if (slots.length > 0) {
            appointmentId = slots[0]._id;
            console.log(`\n⚠️  Could not find a slot >24h away. Using earliest slot: ${appointmentId}. Cancellation test MAY fail.\n`);
        }

        return true;
    } catch (error) {
        logResult('Get Available Slots', false, null, error);
        return false;
    }
}

async function testBookAppointment() {
    if (!appointmentId) {
        console.log('\n⚠️  No appointment ID found. Skipping booking test.\n');
        return false;
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/appointments/book`,
            { appointmentId },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        logResult('Book Appointment', true, response.data);
        return true;
    } catch (error) {
        logResult('Book Appointment', false, null, error);
        return false;
    }
}

async function testGetUserAppointments() {
    try {
        const response = await axios.get(
            `${BASE_URL}/appointments/my-appointments`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        logResult('Get User Appointments', true, response.data);
        return true;
    } catch (error) {
        logResult('Get User Appointments', false, null, error);
        return false;
    }
}

async function testCancelAppointment() {
    if (!appointmentId) {
        console.log('\n⚠️  No appointment ID found. Skipping cancellation test.\n');
        return false;
    }

    try {
        const response = await axios.delete(
            `${BASE_URL}/appointments/${appointmentId}/cancel`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );
        logResult('Cancel Appointment', true, response.data);
        return true;
    } catch (error) {
        logResult('Cancel Appointment', false, null, error);
        return false;
    }
}

async function runAllTests() {
    console.log('\n🧪 Starting API Tests...');
    console.log(`Test User: ${testUser.email}`);

    const results = { passed: 0, failed: 0 };

    if (await testHealthCheck()) results.passed++; else results.failed++;
    if (await testRegister()) results.passed++; else results.failed++;
    if (await testLogin()) results.passed++; else results.failed++;
    if (await testGetAvailableSlots()) results.passed++; else results.failed++;
    if (await testBookAppointment()) results.passed++; else results.failed++;
    if (await testGetUserAppointments()) results.passed++; else results.failed++;
    if (await testCancelAppointment()) results.passed++; else results.failed++;

    const separator = '='.repeat(60);
    console.log(`\n${separator}`);
    console.log('TEST SUMMARY');
    console.log(`${separator}`);
    console.log(` Passed: ${results.passed}`);
    console.log(` Failed: ${results.failed}`);
    console.log(` Total: ${results.passed + results.failed}`);
    console.log(`${separator}\n`);
}

runAllTests().catch(error => {
    console.error(`\n Fatal Error: ${error}\n`);
    process.exit(1);
});
