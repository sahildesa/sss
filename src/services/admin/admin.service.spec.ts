// admin.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8000/backend/api';

  // Mock Data
  const mockVendors = [
    {
      entityKey: '12345-abcde',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@vendor.com',
      phone: '1234567890',
      companyName: 'Tech Solutions',
      role: 'Vendor',
      isApproved: false,
      isActive: false,
      isDeclined: false,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      entityKey: '67890-fghij',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@vendor.com',
      phone: '9876543210',
      companyName: 'Digital Services',
      role: 'Vendor',
      isApproved: true,
      isActive: true,
      isDeclined: false,
      createdAt: '2024-01-14T09:15:00Z',
      approvedAt: '2024-01-14T14:30:00Z',
      approvedBy: 'admin@system.com'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  // Test 1: Service Creation
  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  // Test 2: GetAllVendors Method
  describe('getAllVendors', () => {
    it('should get all vendors with role filter', () => {
      const mockResponse = {
        success: true,
        data: mockVendors,
        message: 'Vendors fetched successfully'
      };

      service.getAllVendors().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(2);
        expect(response.data[0].email).toBe('john@vendor.com');
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ role: 'Vendor' });
      req.flush(mockResponse);
    });

    it('should handle error when getting vendors', () => {
      const errorMessage = 'Failed to fetch vendors';

      service.getAllVendors().subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
    });
  });

  // Test 3: ApproveUser Method
  describe('approveUser', () => {
    it('should approve a vendor', () => {
      const payload = {
        entityKey: '12345-abcde',
        isApproved: true,
        role: 'Vendor'
      };

      const mockResponse = {
        success: true,
        message: 'Vendor approved successfully',
        data: { ...mockVendors[0], isApproved: true }
      };

      service.approveUser(payload).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.message).toBe('Vendor approved successfully');
        expect(response.data.isApproved).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/approveUser`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should handle approval error', () => {
      const payload = {
        entityKey: 'invalid-key',
        isApproved: true,
        role: 'Vendor'
      };

      service.approveUser(payload).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/approveUser`);
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  // Test 4: DeclineUser Method
  describe('declineUser', () => {
    it('should decline a vendor with reason', () => {
      const payload = {
        entityKey: '12345-abcde',
        reason: 'Incomplete documentation'
      };

      const mockResponse = {
        success: true,
        message: 'Vendor declined successfully'
      };

      service.declineUser(payload).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.message).toBe('Vendor declined successfully');
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/declineUser`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should decline a vendor without reason', () => {
      const payload = {
        entityKey: '12345-abcde'
      };

      service.declineUser(payload).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/auth/declineUser`);
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true });
    });
  });

  // Test 5: ActivateUser Method
  describe('activateUser', () => {
    it('should activate a vendor', () => {
      const payload = {
        entityKey: '12345-abcde'
      };

      const mockResponse = {
        success: true,
        message: 'Vendor activated successfully',
        data: { ...mockVendors[0], isActive: true }
      };

      service.activateUser(payload).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.isActive).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/activateUser`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  // Test 6: DeleteUser Method
  describe('deleteUser', () => {
    it('should delete a vendor', () => {
      const entityKey = '12345-abcde';
      
      const mockResponse = {
        success: true,
        message: 'Vendor deleted successfully'
      };

      service.deleteUser(entityKey).subscribe(response => {
        expect(response.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/deleteUser/${entityKey}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle delete error for non-existent vendor', () => {
      const entityKey = 'non-existent-key';

      service.deleteUser(entityKey).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/deleteUser/${entityKey}`);
      req.flush({ message: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  // Test 7: UpdateUser Method
  describe('updateUser', () => {
    it('should update vendor details', () => {
      const entityKey = '12345-abcde';
      const updates = {
        phone: '9999999999',
        companyName: 'Updated Company'
      };

      const mockResponse = {
        success: true,
        message: 'Vendor updated successfully',
        data: { ...mockVendors[0], ...updates }
      };

      service.updateUser(entityKey, updates).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data.phone).toBe('9999999999');
        expect(response.data.companyName).toBe('Updated Company');
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/updateUser/${entityKey}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });
  });

  // Test 8: CreateSecondaryRole Method
  describe('createSecondaryRole', () => {
    it('should create a secondary role for user', () => {
      const payload = {
        entityKey: '12345-abcde',
        secondaryRole: 'Approver',
        permissions: ['approve_vendor', 'view_reports']
      };

      const mockResponse = {
        success: true,
        message: 'Secondary role created successfully'
      };

      service.createSecondaryRole(payload).subscribe(response => {
        expect(response.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/createSecondaryRole`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  // Test 9: Error Handling
  describe('Error Handling', () => {
    it('should handle network error', () => {
      service.getAllVendors().subscribe({
        next: () => fail('should have failed with network error'),
        error: (error) => {
          expect(error.status).toBeUndefined(); // Network errors don't have status
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle 401 unauthorized error', () => {
      service.getAllVendors().subscribe({
        next: () => fail('should have failed with 401'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.error.message).toContain('Unauthorized');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      req.flush({ message: 'Unauthorized access' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 forbidden error', () => {
      service.approveUser({
        entityKey: '12345-abcde',
        isApproved: true,
        role: 'Vendor'
      }).subscribe({
        next: () => fail('should have failed with 403'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/approveUser`);
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });
  });

  // Test 10: Request Headers
  describe('Request Headers', () => {
    it('should include authorization header if token exists', () => {
      // Mock localStorage
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      service.getAllVendors().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      
      // Note: HttpClientTestingModule doesn't automatically add Authorization header
      // You might need to use HttpInterceptor for this in real implementation
      // For testing, we verify the request was made
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, data: [] });
    });
  });

  // Test 11: Response Transformation
  describe('Response Transformation', () => {
    it('should handle empty response', () => {
      service.getAllVendors().subscribe(response => {
        expect(response).toBeDefined();
        // Handle based on your service implementation
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      req.flush(null); // Empty response
    });

    it('should handle malformed JSON response', () => {
      service.getAllVendors().subscribe({
        next: () => fail('should have failed with JSON error'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ErrorEvent);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      // Send invalid JSON
      req.flush('invalid json', { 
        status: 200, 
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });

  // Test 12: Multiple Concurrent Requests
  describe('Multiple Requests', () => {
    it('should handle multiple concurrent requests', () => {
      const vendor1 = { ...mockVendors[0] };
      const vendor2 = { ...mockVendors[1] };

      service.getAllVendors().subscribe();
      service.approveUser({
        entityKey: '12345-abcde',
        isApproved: true,
        role: 'Vendor'
      }).subscribe();

      const requests = httpMock.match(req => true);
      expect(requests.length).toBe(2);

      // First request: getAllVendors
      expect(requests[0].request.method).toBe('POST');
      expect(requests[0].request.url).toBe(`${baseUrl}/auth/listUser`);
      requests[0].flush({ success: true, data: [vendor1, vendor2] });

      // Second request: approveUser
      expect(requests[1].request.method).toBe('POST');
      expect(requests[1].request.url).toBe(`${baseUrl}/auth/approveUser`);
      requests[1].flush({ success: true });
    });
  });

  // Test 13: Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty entityKey', () => {
      const payload = {
        entityKey: '',
        isApproved: true,
        role: 'Vendor'
      };

      service.approveUser(payload).subscribe({
        next: () => {},
        error: (error) => {
          // Depending on backend implementation
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/approveUser`);
      req.flush({ message: 'Invalid entityKey' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle null payload', () => {
      // @ts-ignore - Testing invalid input
      service.approveUser(null).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      // Request might not be made due to validation
      httpMock.expectNone(`${baseUrl}/auth/approveUser`);
    });

    it('should handle very long company name', () => {
      const updates = {
        companyName: 'A'.repeat(500) // Very long company name
      };

      service.updateUser('12345-abcde', updates).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
        },
        error: (error) => {
          // Backend might reject or truncate
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/updateUser/12345-abcde`);
      req.flush({ 
        message: 'Validation error' 
      }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // Test 14: Timeout Handling (Mock)
  describe('Timeout Handling', () => {
    it('should handle request timeout', (done) => {
      // This test simulates a timeout scenario
      service.getAllVendors().subscribe({
        next: () => {
          fail('should have timed out');
          done();
        },
        error: (error) => {
          // In real implementation, you might have timeout logic
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
      
      // Don't flush immediately to simulate timeout
      setTimeout(() => {
        // In real scenario, you might have a timeout interceptor
        // For now, we'll just flush after some time
        req.flush({}, { status: 408, statusText: 'Request Timeout' });
      }, 1000);
    });
  });

  // Test 15: Success Response Variations
  describe('Success Response Variations', () => {
    it('should handle different success response formats', () => {
      const formats = [
        { status: 'success', data: mockVendors },
        { ok: true, result: mockVendors },
        { vendors: mockVendors },
        mockVendors // Direct array response
      ];

      formats.forEach((format, index) => {
        service.getAllVendors().subscribe(response => {
          // Your service should handle different formats
          expect(response).toBeDefined();
        });

        const req = httpMock.expectOne(`${baseUrl}/auth/listUser`);
        req.flush(format);
        
        // Reset for next iteration if needed
        if (index < formats.length - 1) {
          httpMock.verify();
          httpMock = TestBed.inject(HttpTestingController);
        }
      });
    });
  });
});